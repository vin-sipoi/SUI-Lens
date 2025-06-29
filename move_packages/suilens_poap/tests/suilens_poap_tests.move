module suilens_poap::poap {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::event;
    use sui::table::{Self, Table};
    use suilens_poap::event_manager::{Self, Event};

    /// POAP NFT
    struct POAP has key, store {
        id: UID,
        event_id: ID,
        event_name: String,
        attendee: address,
        image_url: String,
        claimed_at: u64,
        metadata: String,
    }

    /// POAP Registry to track claims
    struct POAPRegistry has key {
        id: UID,
        claims: Table<address, vector<ID>>, // attendee -> poap_ids
        event_claims: Table<ID, vector<address>>, // event_id -> attendees
    }

    /// POAP minted event
    struct POAPMinted has copy, drop {
        poap_id: ID,
        event_id: ID,
        attendee: address,
        event_name: String,
    }

    /// Initialize POAP registry
    fun init(ctx: &mut TxContext) {
        let registry = POAPRegistry {
            id: object::new(ctx),
            claims: table::new(ctx),
            event_claims: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    /// Mint POAP for event attendance
    public entry fun mint_poap(
        event: &Event,
        registry: &mut POAPRegistry,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext
    ) {
        let attendee = tx_context::sender(ctx);
        let event_id = object::id(event);
        
        // Check if already claimed
        if (table::contains(&registry.event_claims, event_id)) {
            let attendees = table::borrow(&registry.event_claims, event_id);
            // Add logic to check if attendee already claimed
        };

        let poap = POAP {
            id: object::new(ctx),
            event_id,
            event_name: event_manager::get_event_name(event),
            attendee,
            image_url: event_manager::get_poap_template(event),
            claimed_at: sui::clock::timestamp_ms(clock),
            metadata: string::utf8(b"Suilens Event Attendance POAP"),
        };

        let poap_id = object::id(&poap);

        // Update registry
        if (!table::contains(&registry.claims, attendee)) {
            table::add(&mut registry.claims, attendee, vector::empty());
        };
        let user_poaps = table::borrow_mut(&mut registry.claims, attendee);
        vector::push_back(user_poaps, poap_id);

        if (!table::contains(&registry.event_claims, event_id)) {
            table::add(&mut registry.event_claims, event_id, vector::empty());
        };
        let event_attendees = table::borrow_mut(&mut registry.event_claims, event_id);
        vector::push_back(event_attendees, attendee);

        event::emit(POAPMinted {
            poap_id,
            event_id,
            attendee,
            event_name: event_manager::get_event_name(event),
        });

        transfer::public_transfer(poap, attendee);
    }
}
