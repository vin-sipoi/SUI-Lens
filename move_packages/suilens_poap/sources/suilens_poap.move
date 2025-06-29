module suilens_poap::poap {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::event;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::url::{Self, Url};

    /// POAP NFT struct
    struct POAP has key, store {
        id: UID,
        event_id: ID,
        name: String,
        description: String,
        image_url: Url,
        attendee: address,
        minted_at: u64,
        metadata: String,
    }

    /// POAP Registry
    struct POAPRegistry has key {
        id: UID,
        poaps: Table<address, vector<ID>>, // attendee -> poap_ids
        admin: address,
    }

    /// POAP minted event
    struct POAPMinted has copy, drop {
        poap_id: ID,
        event_id: ID,
        attendee: address,
        minted_at: u64,
    }

    /// Initialize the POAP registry
    fun init(ctx: &mut TxContext) {
        let registry = POAPRegistry {
            id: object::new(ctx),
            poaps: table::new(ctx),
            admin: tx_context::sender(ctx),
        };
        transfer::share_object(registry);
    }

    /// Mint a POAP for an attendee
    public entry fun mint_poap(
        event_id: ID,
        name: vector<u8>,
        image_url: vector<u8>,
        metadata: vector<u8>,
        attendee: address,
        registry: &mut POAPRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let poap = POAP {
            id: object::new(ctx),
            event_id,
            name: string::utf8(name),
            description: string::utf8(b"Proof of Attendance Protocol NFT"),
            image_url: url::new_unsafe_from_bytes(image_url),
            attendee,
            minted_at: clock::timestamp_ms(clock),
            metadata: string::utf8(metadata),
        };

        let poap_id = object::id(&poap);

        // Update registry
        if (table::contains(&registry.poaps, attendee)) {
            let user_poaps = table::borrow_mut(&mut registry.poaps, attendee);
            vector::push_back(user_poaps, poap_id);
        } else {
            let new_poaps = vector::empty<ID>();
            vector::push_back(&mut new_poaps, poap_id);
            table::add(&mut registry.poaps, attendee, new_poaps);
        };

        event::emit(POAPMinted {
            poap_id,
            event_id,
            attendee,
            minted_at: clock::timestamp_ms(clock),
        });

        transfer::transfer(poap, attendee);
    }

    /// Get POAP details (public view function)
    public fun get_poap_details(poap: &POAP): (ID, String, String, Url, address, u64) {
        (
            poap.event_id,
            poap.name,
            poap.description,
            poap.image_url,
            poap.attendee,
            poap.minted_at
        )
    }
}
