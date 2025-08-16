/// SuilensPOAP: Proof of Attendance Protocol NFT system
#[allow(duplicate_alias, unused_const, lint(self_transfer))]
module suilens_contracts::suilens_poap {
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use sui::vec_map::{Self, VecMap};
    use sui::display;
    use sui::package;
    use suilens_contracts::suilens_core::{Self, GlobalRegistry};

    // ======== Error Constants ========
    const E_NOT_AUTHORIZED: u64 = 0;
    const E_EVENT_NOT_FOUND: u64 = 1;
    const E_POAP_NOT_FOUND: u64 = 2;
    const E_ALREADY_CLAIMED: u64 = 3;
    const E_NOT_ATTENDEE: u64 = 4;
    const E_EVENT_NOT_ENDED: u64 = 5;
    const E_POAP_NOT_ACTIVE: u64 = 6;
    const E_MAX_SUPPLY_REACHED: u64 = 7;
    const E_EVENT_NOT_STARTED: u64 = 8;

    // ======== Structs ========

    /// One-time witness for the module
    public struct SUILENS_POAP has drop {}

    /// POAP Collection for an event
    public struct POAPCollection has key, store {
        id: UID,
        event_id: ID,
        creator: address,
        name: String,
        description: String,
        image_url: String,
        max_supply: Option<u64>,
        claimed_count: u64,
        claimers: VecSet<address>,
        is_active: bool,
        metadata: VecMap<String, String>,
        created_at: u64,
    }

    /// Individual POAP NFT
    public struct POAP has key, store {
        id: UID,
        collection_id: ID,
        event_id: ID,
        name: String,
        description: String,
        image_url: String,
        claimed_by: address,
        claimed_at: u64,
        attributes: VecMap<String, String>,
    }

    /// Registry for all POAP collections
    public struct POAPRegistry has key {
        id: UID,
        collections: Table<ID, POAPCollection>,
        event_collections: Table<ID, ID>, // event_id -> collection_id mapping
        user_poaps: Table<address, VecSet<ID>>,
        total_collections: u64,
        total_poaps_minted: u64,
    }

    // ======== Events ========

    public struct POAPCollectionCreated has copy, drop {
        collection_id: ID,
        event_id: ID,
        creator: address,
        name: String,
    }

    public struct POAPClaimed has copy, drop {
        poap_id: ID,
        collection_id: ID,
        event_id: ID,
        claimer: address,
    }

    // ======== Init Function ========

    fun init(witness: SUILENS_POAP, ctx: &mut TxContext) {
        let poap_registry = POAPRegistry {
            id: object::new(ctx),
            collections: table::new(ctx),
            event_collections: table::new(ctx),
            user_poaps: table::new(ctx),
            total_collections: 0,
            total_poaps_minted: 0,
        };

        // Create display template for POAP NFTs
        let publisher = package::claim(witness, ctx);
        let mut display = display::new<POAP>(&publisher, ctx);
        
        display::add(&mut display, string::utf8(b"name"), string::utf8(b"{name}"));
        display::add(&mut display, string::utf8(b"description"), string::utf8(b"{description}"));
        display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{image_url}"));
        display::add(&mut display, string::utf8(b"project_url"), string::utf8(b"https://suilens.xyz"));
        display::add(&mut display, string::utf8(b"creator"), string::utf8(b"SUI-Lens Platform"));
        
        display::update_version(&mut display);
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
        transfer::share_object(poap_registry);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SUILENS_POAP {}, ctx);
    }

    // ======== POAP Collection Functions ========

    /// Create a POAP collection for an event
    public fun create_poap_collection(
        registry: &mut POAPRegistry,
        global_registry: &GlobalRegistry,
        event_id: ID,
        name: String,
        description: String,
        image_url: String,
        max_supply: Option<u64>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        
        // Verify sender is the event creator
        assert!(suilens_core::get_event_creator(global_registry, event_id) == creator, E_NOT_AUTHORIZED);
        
        // Check if POAP collection already exists for this event
        assert!(!table::contains(&registry.event_collections, event_id), E_ALREADY_CLAIMED);

        let collection_id = object::new(ctx);
        let collection_id_copy = object::uid_to_inner(&collection_id);

        let collection = POAPCollection {
            id: collection_id,
            event_id,
            creator,
            name,
            description,
            image_url,
            max_supply,
            claimed_count: 0,
            claimers: vec_set::empty(),
            is_active: true,
            metadata: vec_map::empty(),
            created_at: clock::timestamp_ms(clock),
        };

        event::emit(POAPCollectionCreated {
            collection_id: collection_id_copy,
            event_id,
            creator,
            name: collection.name,
        });

        // Add to registries
        table::add(&mut registry.collections, collection_id_copy, collection);
        table::add(&mut registry.event_collections, event_id, collection_id_copy);
        registry.total_collections = registry.total_collections + 1;
    }

    /// Claim a POAP for attending an event
    public fun claim_poap(
        poap_registry: &mut POAPRegistry,
        global_registry: &GlobalRegistry,
        event_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let claimer = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        // Verify event exists and user actually attended (checked in)
        assert!(suilens_core::has_attended_event(global_registry, event_id, claimer), E_NOT_ATTENDEE);
        
        // Verify event has started (POAPs can be claimed during or after the event)
        let event_start = suilens_core::get_event_start_date(global_registry, event_id);
        assert!(current_time >= event_start, E_EVENT_NOT_STARTED);
        
        // Get POAP collection for this event
        assert!(table::contains(&poap_registry.event_collections, event_id), E_POAP_NOT_FOUND);
        let collection_id = *table::borrow(&poap_registry.event_collections, event_id);
        let collection = table::borrow_mut(&mut poap_registry.collections, collection_id);
        
        // Verify collection is active
        assert!(collection.is_active, E_POAP_NOT_ACTIVE);
        
        // Check if user already claimed
        assert!(!vec_set::contains(&collection.claimers, &claimer), E_ALREADY_CLAIMED);
        
        // Check max supply
        if (option::is_some(&collection.max_supply)) {
            let max = *option::borrow(&collection.max_supply);
            assert!(collection.claimed_count < max, E_MAX_SUPPLY_REACHED);
        };

        // Create POAP NFT
        let poap_id = object::new(ctx);
        let poap_id_copy = object::uid_to_inner(&poap_id);
        
        let mut poap = POAP {
            id: poap_id,
            collection_id,
            event_id,
            name: collection.name,
            description: collection.description,
            image_url: collection.image_url,
            claimed_by: claimer,
            claimed_at: current_time,
            attributes: vec_map::empty(),
        };

        // Add event details as attributes
        vec_map::insert(&mut poap.attributes, string::utf8(b"event_title"), suilens_core::get_event_title(global_registry, event_id));
        vec_map::insert(&mut poap.attributes, string::utf8(b"event_location"), suilens_core::get_event_location(global_registry, event_id));

        // Update collection stats
        collection.claimed_count = collection.claimed_count + 1;
        vec_set::insert(&mut collection.claimers, claimer);

        // Update user's POAP collection
        if (!table::contains(&poap_registry.user_poaps, claimer)) {
            table::add(&mut poap_registry.user_poaps, claimer, vec_set::empty());
        };
        let user_poaps = table::borrow_mut(&mut poap_registry.user_poaps, claimer);
        vec_set::insert(user_poaps, poap_id_copy);

        // Update global stats
        poap_registry.total_poaps_minted = poap_registry.total_poaps_minted + 1;

        // Transfer POAP to claimer
        transfer::public_transfer(poap, claimer);

        event::emit(POAPClaimed {
            poap_id: poap_id_copy,
            collection_id,
            event_id,
            claimer,
        });
    }

    /// Update POAP collection details
    public fun update_collection(
        registry: &mut POAPRegistry,
        collection_id: ID,
        name: String,
        description: String,
        image_url: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&registry.collections, collection_id), E_POAP_NOT_FOUND);
        
        let collection = table::borrow_mut(&mut registry.collections, collection_id);
        assert!(collection.creator == sender, E_NOT_AUTHORIZED);

        collection.name = name;
        collection.description = description;
        collection.image_url = image_url;
    }

    /// Deactivate a POAP collection
    public fun deactivate_collection(
        registry: &mut POAPRegistry,
        collection_id: ID,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&registry.collections, collection_id), E_POAP_NOT_FOUND);
        
        let collection = table::borrow_mut(&mut registry.collections, collection_id);
        assert!(collection.creator == sender, E_NOT_AUTHORIZED);

        collection.is_active = false;
    }

    /// Add metadata to collection
    public fun add_collection_metadata(
        registry: &mut POAPRegistry,
        collection_id: ID,
        key: String,
        value: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&registry.collections, collection_id), E_POAP_NOT_FOUND);
        
        let collection = table::borrow_mut(&mut registry.collections, collection_id);
        assert!(collection.creator == sender, E_NOT_AUTHORIZED);

        vec_map::insert(&mut collection.metadata, key, value);
    }

    // ======== View Functions ========

    /// Get POAP collection details
    public fun get_collection(registry: &POAPRegistry, collection_id: ID): &POAPCollection {
        table::borrow(&registry.collections, collection_id)
    }

    /// Get collection for an event
    public fun get_event_collection(registry: &POAPRegistry, event_id: ID): Option<ID> {
        if (table::contains(&registry.event_collections, event_id)) {
            option::some(*table::borrow(&registry.event_collections, event_id))
        } else {
            option::none()
        }
    }

    /// Get user's POAP collection
    public fun get_user_poaps(registry: &POAPRegistry, user: address): VecSet<ID> {
        if (table::contains(&registry.user_poaps, user)) {
            *table::borrow(&registry.user_poaps, user)
        } else {
            vec_set::empty()
        }
    }

    /// Check if user has claimed POAP for an event
    public fun has_claimed_poap(registry: &POAPRegistry, event_id: ID, user: address): bool {
        if (!table::contains(&registry.event_collections, event_id)) {
            return false
        };
        
        let collection_id = *table::borrow(&registry.event_collections, event_id);
        let collection = table::borrow(&registry.collections, collection_id);
        vec_set::contains(&collection.claimers, &user)
    }

    /// Get total POAPs minted
    public fun get_total_poaps_minted(registry: &POAPRegistry): u64 {
        registry.total_poaps_minted
    }

    /// Get collection claim count
    public fun get_collection_claims(registry: &POAPRegistry, collection_id: ID): u64 {
        let collection = table::borrow(&registry.collections, collection_id);
        collection.claimed_count
    }
}