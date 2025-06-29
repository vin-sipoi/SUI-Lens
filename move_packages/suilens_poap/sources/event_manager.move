module suilens_poap::event_manager {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::event;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};

    /// Event struct
    struct Event has key, store {
        id: UID,
        name: String,
        description: String,
        creator: address,
        start_time: u64,
        end_time: u64,
        max_attendees: u64,
        poap_template: String, // IPFS hash for POAP image
        is_active: bool,
    }

    /// Event Registry
    struct EventRegistry has key {
        id: UID,
        events: Table<ID, bool>, // event_id -> is_active
        admin: address,
    }

    /// Event created event
    struct EventCreated has copy, drop {
        event_id: ID,
        creator: address,
        name: String,
    }

    /// Initialize the registry
    fun init(ctx: &mut TxContext) {
        let registry = EventRegistry {
            id: object::new(ctx),
            events: table::new(ctx),
            admin: tx_context::sender(ctx),
        };
        transfer::share_object(registry);
    }

    /// Create a new event
    public entry fun create_event(
        name: vector<u8>,
        description: vector<u8>,
        start_time: u64,
        end_time: u64,
        max_attendees: u64,
        poap_template: vector<u8>,
        registry: &mut EventRegistry,
        ctx: &mut TxContext
    ) {
        let event = Event {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            creator: tx_context::sender(ctx),
            start_time,
            end_time,
            max_attendees,
            poap_template: string::utf8(poap_template),
            is_active: true,
        };

        let event_id = object::id(&event);
        table::add(&mut registry.events, event_id, true);

        event::emit(EventCreated {
            event_id,
            creator: tx_context::sender(ctx),
            name: string::utf8(name),
        });

        transfer::share_object(event);
    }
}