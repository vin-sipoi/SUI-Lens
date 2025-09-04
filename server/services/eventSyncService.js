const { SuiClient } = require('@mysten/sui/client');
const Event = require('../models/Event.js');
const Registration = require('../models/Registrations.js');

class EventSyncService {
  constructor() {
    this.suiClient = new SuiClient({ url: 'https://fullnode.mainnet.sui.io:443' });
    this.eventsTableId = '0x177bb1957381fcefc7583a0416be84a25d5187df3a41d06294d40ddb96606d5a';
    this.attendanceTableId = '0x8443bad7da2b03736e375ef30505978007e391139c052bd85fcc35d5327f1c7f';
  }

  async syncEventsFromBlockchain() {
    try {
      console.log('Starting blockchain event sync...');
      
      const events = await this.fetchEventsFromTable(this.eventsTableId);
      
      for (const eventData of events) {
        await this.syncSingleEvent(eventData);
      }
      
      console.log(`Synced ${events.length} events from blockchain`);
    } catch (error) {
      console.error('Error syncing events:', error);
    }
  }

  async fetchEventsFromTable(tableId) {
    const events = [];
    let hasNextPage = true;
    let cursor = null;

    while (hasNextPage) {
      const response = await this.suiClient.getDynamicFields({
        parentId: tableId,
        cursor,
      });

      for (const field of response.data) {
        const eventDetail = await this.suiClient.getObject({
          id: field.objectId,
          options: { showContent: true }
        });

        if (eventDetail.data && eventDetail.data.content) {
          // Pass the field information to parseEventData so it can use the correct event ID
          const eventData = this.parseEventData(eventDetail.data.content, field);
          events.push(eventData);
        }
      }

      hasNextPage = response.hasNextPage;
      cursor = response.nextCursor;
    }

    return events;
  }

  parseEventData(content, field = null) {
    const fields = content.fields?.value?.fields || {};
    
    // Use the field's name.value as the event ID if available, otherwise fallback to the existing logic
    let id;
    if (field && field.name && field.name.value) {
      id = field.name.value;
    } else {
      // Normalize on-chain id to a flat string (Sui often nests id objects)
      const rawId =
        content.fields?.name?.value ||
        content.fields?.id?.id ||
        content.fields?.id ||
        fields.id?.id ||
        fields.id ||
        null;
      
      id = typeof rawId === 'object' && rawId !== null ? (rawId.id ?? String(rawId)) : String(rawId || '');
    }

    const startDate = this.normalizeToDate(fields.start_date) ?? new Date();
    const endDate = this.normalizeToDate(fields.end_date) ?? new Date();
    
    return {
      id,
      title: fields.title || 'Untitled Event',
      description: fields.description || '',
      location: fields.location || '',
      startDate,
      endDate,
      maxAttendees: Number(fields.max_attendees || 0),
      ticketPrice: Number(fields.ticket_price || 0),
      isFree: fields.is_free !== false,
      creator: fields.creator || '',
      isActive: fields.is_active !== false,
      totalRsvps: 0,
      totalAttendance: 0
    };
  }

  // Normalize various timestamp formats (seconds, ms, us, ns, ISO strings) to a valid Date
  normalizeToDate(value) {
    try {
      if (value == null) return null;
      if (value instanceof Date && !isNaN(value)) return value;

      // Unwrap common nested shapes
      const v = typeof value === 'object'
        ? (value.value ?? value.fields?.value ?? value.seconds ?? value.milliseconds ?? value)
        : value;

      if (typeof v === 'string') {
        const t = v.trim();
        if (/^\d+$/.test(t)) {
          let n = Number(t);
          if (!isFinite(n)) return null;
          // Heuristics to convert to ms
          if (n > 1e14) n = Math.floor(n / 1e6); // ns -> ms
          else if (n > 1e12) n = Math.floor(n / 1e3); // µs -> ms
          else if (n < 1e12) n = n * 1000; // seconds -> ms
          const d = new Date(n);
          return isNaN(d) ? null : d;
        } else {
          const d = new Date(t);
          return isNaN(d) ? null : d;
        }
      } else if (typeof v === 'number') {
        let n = v;
        if (n > 1e14) n = Math.floor(n / 1e6);
        else if (n > 1e12) n = Math.floor(n / 1e3);
        else if (n < 1e12) n = n * 1000;
        const d = new Date(n);
        return isNaN(d) ? null : d;
      }

      const d = new Date(v);
      return isNaN(d) ? null : d;
    } catch {
      return null;
    }
  }

  async syncSingleEvent(eventData) {
    try {
      const existingEvent = await Event.findOne({ where: { suiEventId: eventData.id } });
      
      if (!existingEvent) {
        await Event.create({
          id: eventData.id, // use on-chain id as primary key
          suiEventId: eventData.id,
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          startDate: this.normalizeToDate(eventData.startDate) ?? new Date(),
          endDate: this.normalizeToDate(eventData.endDate) ?? new Date(),
          // Respect model min: 1; when missing, let DB default (100) apply
          capacity: (eventData.maxAttendees != null && !isNaN(Number(eventData.maxAttendees)))
            ? Math.max(1, Number(eventData.maxAttendees))
            : undefined,
          ticketPrice: Number(eventData.ticketPrice || 0),
          isFree: !!eventData.isFree,
          createdBy: eventData.creator || null,
          isActive: eventData.isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`Synced event: ${eventData.title} (${eventData.id})`);
      }
    } catch (error) {
      console.error(`Error syncing event ${eventData.id}:`, error);
    }
  }

  async syncRegistrationsForEvent(eventId) {
    try {
      const registrations = await this.suiClient.getDynamicFields({
        parentId: this.attendanceTableId,
      });

      for (const registration of registrations.data) {
        const regDetail = await this.suiClient.getObject({
          id: registration.objectId,
          options: { showContent: true }
        });

        if (regDetail.data && regDetail.data.content) {
          await this.parseRegistrationData(regDetail.data.content, eventId);
        }
      }
    } catch (error) {
      console.error(`Error syncing registrations for ${eventId}:`, error);
    }
  }

  // Fetch a single event by on-chain object id and sync it to DB
  async syncEventById(eventId) {
    try {
      // First, we need to find the field in the events table that corresponds to this event ID
      // The field's name.value should match the eventId, not the field's objectId
      const dynamicFields = await this.suiClient.getDynamicFields({
        parentId: this.eventsTableId,
      });

      let fieldObjectId = null;
      for (const field of dynamicFields.data) {
        if (field.name && field.name.value === eventId) {
          fieldObjectId = field.objectId;
          break;
        }
      }

      if (!fieldObjectId) {
        console.log(`Event field not found for event ID: ${eventId}`);
        return false;
      }

      // Now fetch the event using the field's object ID
      const eventDetail = await this.suiClient.getObject({
        id: fieldObjectId,
        options: { showContent: true }
      });

      const content = eventDetail?.data?.content;
      if (!content) return false;

      const eventData = this.parseEventData(content);
      await this.syncSingleEvent(eventData);
      return true;
    } catch (error) {
      console.error(`Error syncing event by id ${eventId}:`, error);
      return false;
    }
  }

  async parseRegistrationData(content, eventId) {
    const fields = content.fields?.value?.fields || {};
    const attendees = fields.attendees?.fields?.contents || [];
    
    for (const attendee of attendees) {
      await Registration.create({
        eventId,
        userAddress: attendee,
        registeredAt: new Date(),
        status: 'registered'
      });
    }
  }
}

module.exports = EventSyncService;
