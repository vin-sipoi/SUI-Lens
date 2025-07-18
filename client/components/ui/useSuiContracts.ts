"use client";

import { useCallback, useMemo } from 'react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
// import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { SUI_CONTRACTS, getContractCall, toMoveAmount, toMoveTimestamp } from '@/lib/sui-contracts';
import { toast } from 'sonner';

export interface CreateEventParams {
  title: string;
  description: string;
  imageUrl: string;
  startDate: Date;
  endDate: Date;
  location: string;
  category: string;
  capacity?: number;
  ticketPrice: number;
  requiresApproval: boolean;
  isPrivate: boolean;
}

export interface CreateProfileParams {
  username: string;
  bio: string;
  avatarUrl: string;
}

export function useSuiContracts() {
  const client = useSuiClient();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const createProfile = async (params: CreateProfileParams) => {
    try {
      // Validate string field lengths to prevent SizeLimitExceeded error
      const MAX_STRING_SIZE = 16000; // Leave some buffer below 16384 limit
      
      const validateStringSize = (value: string, fieldName: string) => {
        const sizeInBytes = new TextEncoder().encode(value).length;
        if (sizeInBytes > MAX_STRING_SIZE) {
          throw new Error(`${fieldName} is too long (${sizeInBytes} bytes). Maximum allowed is ${MAX_STRING_SIZE} bytes.`);
        }
      };
      
      validateStringSize(params.username, 'Username');
      validateStringSize(params.bio, 'Bio');
      validateStringSize(params.avatarUrl, 'Avatar URL');

      const tx = new Transaction();

      // Call create_profile function
      tx.moveCall({
        target: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.core}::${SUI_CONTRACTS.functions.createProfile}`,
        arguments: [
          tx.object(SUI_CONTRACTS.objects.globalRegistry),
          tx.pure.string(params.username),
          tx.pure.string(params.bio),
          tx.pure.string(params.avatarUrl),
          tx.object.clock(), // Clock object
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Profile created successfully:', result);
            toast.success('Profile created successfully!');
          },
          onError: (error) => {
            console.error('Error creating profile:', error);
            toast.error('Failed to create profile');
          },
        }
      );
    } catch (error) {
      console.error('Error building transaction:', error);
      toast.error('Failed to build transaction');
    }
  };

  const createEvent = async (params: CreateEventParams) => {
    try {
      // Validate string field lengths to prevent SizeLimitExceeded error
      const MAX_STRING_SIZE = 16000; // Leave some buffer below 16384 limit
      
      const validateStringSize = (value: string, fieldName: string) => {
        const sizeInBytes = new TextEncoder().encode(value).length;
        if (sizeInBytes > MAX_STRING_SIZE) {
          throw new Error(`${fieldName} is too long (${sizeInBytes} bytes). Maximum allowed is ${MAX_STRING_SIZE} bytes.`);
        }
      };
      
      validateStringSize(params.title, 'Title');
      validateStringSize(params.description, 'Description');
      validateStringSize(params.imageUrl, 'Image URL');
      validateStringSize(params.location, 'Location');
      validateStringSize(params.category, 'Category');

      const tx = new Transaction();

      // Convert dates to timestamps
      const startTimestamp = toMoveTimestamp(params.startDate);
      const endTimestamp = toMoveTimestamp(params.endDate);
      
      // Convert ticket price to MIST
      const ticketPriceInMist = toMoveAmount(params.ticketPrice);
      
      // Handle optional capacity
      const capacityArg = params.capacity 
        ? tx.pure.option('u64', params.capacity)
        : tx.pure.option('u64', null);

      // Call create_event function
      tx.moveCall({
        target: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.core}::${SUI_CONTRACTS.functions.createEvent}`,
        arguments: [
          tx.object(SUI_CONTRACTS.objects.globalRegistry),
          tx.pure.string(params.title),
          tx.pure.string(params.description),
          tx.pure.string(params.imageUrl),
          tx.pure.u64(startTimestamp),
          tx.pure.u64(endTimestamp),
          tx.pure.string(params.location),
          tx.pure.string(params.category),
          capacityArg,
          tx.pure.u64(ticketPriceInMist),
          tx.pure.bool(params.requiresApproval),
          tx.pure.bool(params.isPrivate),
          tx.object.clock(), // Clock object
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Event created successfully:', result);
            toast.success('Event created successfully!');
            
            // Extract event ID from the transaction result
            const eventId = result.effects?.created?.[0]?.reference?.objectId;
            console.log('Extracted event ID:', eventId);
            console.log('Created objects:', result.effects?.created);
            
            if (eventId) {
              // Navigate to event page or dashboard
              // For now, let's go to dashboard since event page might not exist
              window.location.href = '/dashboard';
            } else {
              // If we can't find the event ID, still go to dashboard
              console.log('Could not extract event ID, redirecting to dashboard');
              window.location.href = '/dashboard';
            }
          },
          onError: (error) => {
            console.error('Error creating event:', error);
            toast.error('Failed to create event');
          },
        }
      );
    } catch (error) {
      console.error('Error building transaction:', error);
      toast.error('Failed to build transaction');
    }
  };

  const registerForEvent = async (eventId: string, paymentAmount: number) => {
    try {
      const tx = new Transaction();
      
      // Convert payment to MIST
      const paymentInMist = toMoveAmount(paymentAmount);
      
      // Split coins for payment
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentInMist)]);

      // Call register_for_event function
      tx.moveCall({
        target: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.core}::${SUI_CONTRACTS.functions.registerForEvent}`,
        arguments: [
          tx.object(SUI_CONTRACTS.objects.globalRegistry),
          tx.pure.id(eventId),
          coin,
          tx.object.clock(), // Clock object
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Registration successful:', result);
            toast.success('Successfully registered for event!');
          },
          onError: (error) => {
            console.error('Error registering for event:', error);
            toast.error('Failed to register for event');
          },
        }
      );
    } catch (error) {
      console.error('Error building transaction:', error);
      toast.error('Failed to build transaction');
    }
  };

  const createPoapCollection = async (
    eventId: string,
    name: string,
    description: string,
    imageUrl: string,
    maxSupply?: number
  ) => {
    try {
      const tx = new Transaction();
      
      // Handle optional max supply
      const maxSupplyArg = maxSupply 
        ? tx.pure.option('u64', maxSupply)
        : tx.pure.option('u64', null);

      // Call create_poap_collection function
      tx.moveCall({
        target: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.poap}::${SUI_CONTRACTS.functions.createPoapCollection}`,
        arguments: [
          tx.object(SUI_CONTRACTS.objects.poapRegistry),
          tx.object(SUI_CONTRACTS.objects.globalRegistry),
          tx.pure.id(eventId),
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(imageUrl),
          maxSupplyArg,
          tx.object.clock(), // Clock object
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('POAP collection created successfully:', result);
            toast.success('POAP collection created successfully!');
          },
          onError: (error) => {
            console.error('Error creating POAP collection:', error);
            toast.error('Failed to create POAP collection');
          },
        }
      );
    } catch (error) {
      console.error('Error building transaction:', error);
      toast.error('Failed to build transaction');
    }
  };

  const claimPoap = async (eventId: string) => {
    try {
      const tx = new Transaction();

      // Call claim_poap function
      tx.moveCall({
        target: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.poap}::${SUI_CONTRACTS.functions.claimPoap}`,
        arguments: [
          tx.object(SUI_CONTRACTS.objects.poapRegistry),
          tx.object(SUI_CONTRACTS.objects.globalRegistry),
          tx.pure.id(eventId),
          tx.object.clock(), // Clock object
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('POAP claimed successfully:', result);
            toast.success('POAP claimed successfully!');
          },
          onError: (error) => {
            console.error('Error claiming POAP:', error);
            toast.error('Failed to claim POAP');
          },
        }
      );
    } catch (error) {
      console.error('Error building transaction:', error);
      toast.error('Failed to build transaction');
    }
  };

  // Query functions
  const getUserProfile = async (userAddress: string) => {
    try {
      console.log('Getting profile for address:', userAddress);
      
      // Return a basic profile structure for existing users
      // Note: The actual profile data would need to be fetched using different approach
      // since Move functions that return references can't be called via JSON-RPC
      return {
        wallet_address: userAddress,
        username: 'Sui User', // Default for now - we'd need to implement a getter function
        bio: 'Blockchain enthusiast', // Default for now
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${userAddress.slice(0, 8)}`,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const getEvent = async (eventId: string) => {
    try {
      // Get the event object directly
      const eventObject = await client.getObject({
        id: eventId,
        options: {
          showContent: true,
          showOwner: true,
          showType: true,
        }
      });
      
      if (eventObject.data?.content?.dataType === 'moveObject') {
        return eventObject.data.content.fields;
      }
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  };
  
  const getAllEvents = useCallback(async () => {
    try {
      console.log('Fetching all events from blockchain...');
      console.log('Global Registry ID:', SUI_CONTRACTS.objects.globalRegistry);
      
      // Get the global registry which contains all events
      const registryObject = await client.getObject({
        id: SUI_CONTRACTS.objects.globalRegistry,
        options: {
          showContent: true,
        }
      });
      
      if (!registryObject.data?.content || registryObject.data.content.dataType !== 'moveObject') {
        console.error('Failed to fetch global registry');
        return [];
      }
      
      const registryFields = registryObject.data.content.fields as any;
      console.log('Registry fields:', registryFields);
      
      // Let's also check the user_profiles table structure for debugging
      const userProfilesTableId = registryFields.user_profiles?.fields?.id?.id;
      console.log('User profiles table ID:', userProfilesTableId);
      
      if (userProfilesTableId) {
        try {
          const userTableFields = await client.getDynamicFields({
            parentId: userProfilesTableId,
            limit: 5, // Just get a few for debugging
          });
          console.log('User table dynamic fields (sample):', userTableFields);
        } catch (err) {
          console.log('Error fetching user table fields:', err);
        }
      }
      
      // The events are stored in a table - we need to get the table's ID
      const eventsTableId = registryFields.events?.fields?.id?.id;
      console.log('Events table ID:', eventsTableId);
      
      if (!eventsTableId) {
        console.error('Events table ID not found in registry');
        return [];
      }
      
      // Query dynamic fields of the events table, not the registry
      const dynamicFieldsResponse = await client.getDynamicFields({
        parentId: eventsTableId,
        limit: 50,
      });
      
      console.log('Dynamic fields of events table:', dynamicFieldsResponse);
      
      // In a Sui Table, each dynamic field is a table entry
      // The objectId of each dynamic field is the actual table entry we need to fetch
      const eventFieldIds = dynamicFieldsResponse.data.map(field => field.objectId);
      
      console.log('Event field IDs:', eventFieldIds);
      console.log('Number of events found:', eventFieldIds.length);
      
      if (eventFieldIds.length === 0) {
        console.log('No events found in the table');
        return [];
      }
      
      // Fetch the actual event data from dynamic fields
      const eventDataResponse = await client.multiGetObjects({
        ids: eventFieldIds,
        options: {
          showContent: true,
        }
      });
      
      const events = eventDataResponse
        .filter(obj => obj.data?.content?.dataType === 'moveObject')
        .map(obj => {
          console.log('Raw event object:', obj.data?.content);
          
          // In a table entry, the value is stored in fields.value
          const tableEntry = (obj.data?.content as any)?.fields;
          const fields = tableEntry?.value?.fields || tableEntry?.value;
          
          console.log('Table entry:', tableEntry);
          console.log('Event fields:', fields);
          
          if (!fields) return null;
          
          return {
            id: fields.id?.id || '',
            creator: fields.creator || '',
            title: fields.title || '',
            description: fields.description || '',
            image_url: fields.image_url || '',
            start_date: fields.start_date ? new Date(Number(fields.start_date)) : null,
            end_date: fields.end_date ? new Date(Number(fields.end_date)) : null,
            location: fields.location || '',
            category: fields.category || '',
            capacity: fields.capacity,
            ticket_price: fields.ticket_price || '0',
            is_free: fields.is_free || false,
            requires_approval: fields.requires_approval || false,
            is_private: fields.is_private || false,
            is_active: fields.is_active || true,
            attendees: fields.attendees?.fields || [],
            created_at: fields.created_at ? new Date(Number(fields.created_at)) : null,
            updated_at: fields.updated_at ? new Date(Number(fields.updated_at)) : null,
          };
        })
        .filter(event => event !== null);
          
      console.log('Parsed events:', events);
      
      // If no events found through table, try alternative approach
      if (events.length === 0) {
        console.log('No events found via table, trying event query approach...');
        
        // Try to query EventCreated events as an alternative
        try {
          const eventQuery = await client.queryEvents({
            query: {
              MoveEventType: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.core}::EventCreated`
            },
            limit: 50,
            order: 'descending'
          });
          
          console.log('Event query response:', eventQuery);
          
          // Extract event IDs from emitted events
          const eventIds = eventQuery.data
            .map((event: any) => event.parsedJson?.event_id)
            .filter((id: string) => id);
          
          console.log('Event IDs from events:', eventIds);
          
          // Fetch each event object directly
          if (eventIds.length > 0) {
            const eventObjects = await client.multiGetObjects({
              ids: eventIds,
              options: {
                showContent: true,
              }
            });
            
            const eventsFromQuery = eventObjects
              .filter(obj => obj.data?.content?.dataType === 'moveObject')
              .map(obj => {
                const fields = (obj.data?.content as any)?.fields;
                if (!fields) return null;
                
                return {
                  id: fields.id?.id || '',
                  creator: fields.creator || '',
                  title: fields.title || '',
                  description: fields.description || '',
                  image_url: fields.image_url || '',
                  start_date: fields.start_date ? new Date(Number(fields.start_date)) : null,
                  end_date: fields.end_date ? new Date(Number(fields.end_date)) : null,
                  location: fields.location || '',
                  category: fields.category || '',
                  capacity: fields.capacity,
                  ticket_price: fields.ticket_price || '0',
                  is_free: fields.is_free || false,
                  requires_approval: fields.requires_approval || false,
                  is_private: fields.is_private || false,
                  is_active: fields.is_active || true,
                  attendees: fields.attendees?.fields || [],
                  created_at: fields.created_at ? new Date(Number(fields.created_at)) : null,
                  updated_at: fields.updated_at ? new Date(Number(fields.updated_at)) : null,
                };
              })
              .filter(event => event !== null);
            
            console.log('Events from query approach:', eventsFromQuery);
            return eventsFromQuery;
          }
        } catch (eventError) {
          console.error('Error with event query approach:', eventError);
        }
      }
      
      return events;
    } catch (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
  }, [client]);
  
  const getUserEvents = useCallback(async (userAddress: string) => {
    try {
      console.log('Fetching events for user:', userAddress);
      
      // Get all events and filter by creator
      const allEvents = await getAllEvents();
      const userEvents = allEvents.filter(event => event.creator === userAddress);
      
      console.log('Found user events:', userEvents.length);
      return userEvents;
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
  }, [getAllEvents]);

  const hasUserProfile = async (userAddress: string) => {
    try {
      console.log('Checking profile for address:', userAddress);
      
      const tx = new Transaction();
      tx.moveCall({
        target: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.core}::${SUI_CONTRACTS.functions.hasUserProfile}`,
        arguments: [
          tx.object(SUI_CONTRACTS.objects.globalRegistry),
          tx.pure.address(userAddress),
        ],
      });

      const result = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: userAddress,
      });
      
      console.log('Profile check result:', result);
      console.log('Result structure:', JSON.stringify(result, null, 2));
      
      // Let's explore the result structure
      if (result?.results?.[0]) {
        console.log('First result:', result.results[0]);
        console.log('Return values:', result.results[0].returnValues);
        if (result.results[0].returnValues?.[0]) {
          console.log('First return value:', result.results[0].returnValues[0]);
        }
      }
      
      // Parse the result - the boolean is at results[0].returnValues[0][0][0]
      const hasProfile = result?.results?.[0]?.returnValues?.[0]?.[0]?.[0] === 1;
      
      console.log('Parsed profile exists:', hasProfile);
      return hasProfile;
    } catch (error) {
      console.error('Error checking user profile:', error);
      return false;
    }
  };

  return {
    // Mutations
    createProfile,
    createEvent,
    registerForEvent,
    createPoapCollection,
    claimPoap,
    
    // Queries
    getUserProfile,
    getEvent,
    getAllEvents,
    getUserEvents,
    hasUserProfile,
    
    // Loading state
    isLoading: isPending,
  };
}