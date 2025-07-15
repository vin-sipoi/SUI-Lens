#[test_only]
#[allow(duplicate_alias, unused_use, unused_const)]
module suilens_contracts::suilens_poap_tests {
    use std::string;
    use std::option;
    use std::vector;
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use sui::test_utils::assert_eq;
    use sui::clock::{Self, Clock};
    use sui::vec_set;
    use sui::object;
    use sui::transfer;
    use suilens_contracts::suilens_core::{Self, GlobalRegistry, get_platform_stats, get_user_events_created};
    use suilens_contracts::suilens_poap::{
        Self, POAPRegistry,
        create_poap_collection, claim_poap, update_collection,
        deactivate_collection, has_claimed_poap, get_total_poaps_minted,
        get_collection_claims, add_collection_metadata, get_collection,
        get_event_collection, get_user_poaps
    };

    const ALICE: address = @0xA11CE;
    const BOB: address = @0xB0B;
    const CAROL: address = @0xCA201;

    fun init_test(): Scenario {
        test::begin(ALICE)
    }

    fun setup_test(scenario: &mut Scenario) {
        // Initialize core module
        next_tx(scenario, ALICE);
        {
            suilens_core::init_for_testing(ctx(scenario));
        };

        // Initialize POAP module
        next_tx(scenario, ALICE);
        {
            suilens_poap::init_for_testing(ctx(scenario));
        };

        // Create and share clock
        next_tx(scenario, ALICE);
        {
            clock::share_for_testing(clock::create_for_testing(ctx(scenario)));
        };

        // Create profiles and event for testing
        next_tx(scenario, ALICE);
        {
            let mut registry = test::take_shared<GlobalRegistry>(scenario);
            let clock = test::take_shared<Clock>(scenario);

            suilens_core::create_profile(
                &mut registry,
                string::utf8(b"alice"),
                string::utf8(b"Event organizer"),
                string::utf8(b"alice.png"),
                &clock,
                ctx(scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };

        next_tx(scenario, BOB);
        {
            let mut registry = test::take_shared<GlobalRegistry>(scenario);
            let clock = test::take_shared<Clock>(scenario);

            suilens_core::create_profile(
                &mut registry,
                string::utf8(b"bob"),
                string::utf8(b"Attendee"),
                string::utf8(b"bob.png"),
                &clock,
                ctx(scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };
    }

    fun create_test_event(scenario: &mut Scenario, event_name: vector<u8>): object::ID {
        next_tx(scenario, ALICE);
        {
            let mut registry = test::take_shared<GlobalRegistry>(scenario);
            let clock = test::take_shared<Clock>(scenario);
            let current_time = clock::timestamp_ms(&clock);

            suilens_core::create_event(
                &mut registry,
                string::utf8(event_name),
                string::utf8(b"Test event for POAP"),
                string::utf8(b"test.png"),
                current_time + 86400000,
                current_time + 90000000,
                string::utf8(b"Test Location"),
                string::utf8(b"general"),
                option::some(100),
                0,
                false,
                false,
                &clock,
                ctx(scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };
        
        // Get the event ID from Alice's created events
        next_tx(scenario, ALICE);
        {
            let registry = test::take_shared<GlobalRegistry>(scenario);
            let alice_events = get_user_events_created(&registry, ALICE);
            let event_id = *vector::borrow(&alice_events, vector::length(&alice_events) - 1);
            test::return_shared(registry);
            event_id
        }
    }

    #[test]
    fun test_create_poap_collection() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create an event first and get its ID
        let event_id = create_test_event(&mut scenario, b"Sui Summit 2024");

        // Create POAP collection for the event
        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_poap_collection(
                &mut poap_registry,
                &global_registry,
                event_id,
                string::utf8(b"Sui Summit 2024 POAP"),
                string::utf8(b"Commemorative NFT for Sui Summit 2024 attendees"),
                string::utf8(b"https://example.com/poap-summit-2024.png"),
                option::some(1000), // Max supply of 1000
                &clock,
                ctx(&mut scenario)
            );

            // Verify collection was created
            let collection_option = get_event_collection(&poap_registry, event_id);
            assert!(option::is_some(&collection_option), 0);

            test::return_shared(poap_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    fun test_update_poap_collection() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create event and get its ID
        let event_id = create_test_event(&mut scenario, b"Workshop");
        let mut collection_id = object::id_from_address(@0x0);

        // Create POAP collection
        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_poap_collection(
                &mut poap_registry,
                &global_registry,
                event_id,
                string::utf8(b"Workshop POAP"),
                string::utf8(b"Original description"),
                string::utf8(b"original.png"),
                option::none(),
                &clock,
                ctx(&mut scenario)
            );

            // Get collection ID
            let collection_option = get_event_collection(&poap_registry, event_id);
            if (option::is_some(&collection_option)) {
                collection_id = *option::borrow(&collection_option);
            };

            test::return_shared(poap_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Update the collection
        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);

            update_collection(
                &mut poap_registry,
                collection_id,
                string::utf8(b"Updated Workshop POAP"),
                string::utf8(b"Updated description"),
                string::utf8(b"updated.png"),
                ctx(&mut scenario)
            );

            test::return_shared(poap_registry);
        };

        test::end(scenario);
    }

    #[test]
    fun test_add_collection_metadata() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create event and get its ID
        let event_id = create_test_event(&mut scenario, b"Metadata Test Event");
        let mut collection_id = object::id_from_address(@0x0);

        // Create POAP collection
        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_poap_collection(
                &mut poap_registry,
                &global_registry,
                event_id,
                string::utf8(b"Metadata POAP"),
                string::utf8(b"POAP with metadata"),
                string::utf8(b"metadata-poap.png"),
                option::none(),
                &clock,
                ctx(&mut scenario)
            );

            let collection_option = get_event_collection(&poap_registry, event_id);
            if (option::is_some(&collection_option)) {
                collection_id = *option::borrow(&collection_option);
            };

            test::return_shared(poap_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Add metadata
        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);

            add_collection_metadata(
                &mut poap_registry,
                collection_id,
                string::utf8(b"theme"),
                string::utf8(b"technology"),
                ctx(&mut scenario)
            );

            add_collection_metadata(
                &mut poap_registry,
                collection_id,
                string::utf8(b"year"),
                string::utf8(b"2024"),
                ctx(&mut scenario)
            );

            test::return_shared(poap_registry);
        };

        test::end(scenario);
    }

    #[test]
    fun test_deactivate_collection() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create event and get its ID
        let event_id = create_test_event(&mut scenario, b"Canceled Event");
        let mut collection_id = object::id_from_address(@0x0);

        // Create POAP collection
        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_poap_collection(
                &mut poap_registry,
                &global_registry,
                event_id,
                string::utf8(b"Canceled Event POAP"),
                string::utf8(b"This POAP will be deactivated"),
                string::utf8(b"canceled-poap.png"),
                option::none(),
                &clock,
                ctx(&mut scenario)
            );

            let collection_option = get_event_collection(&poap_registry, event_id);
            if (option::is_some(&collection_option)) {
                collection_id = *option::borrow(&collection_option);
            };

            test::return_shared(poap_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Deactivate the collection
        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);

            deactivate_collection(
                &mut poap_registry,
                collection_id,
                ctx(&mut scenario)
            );

            test::return_shared(poap_registry);
        };

        test::end(scenario);
    }

    #[test]
    fun test_poap_statistics() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Check initial statistics
        next_tx(&mut scenario, ALICE);
        {
            let poap_registry = test::take_shared<POAPRegistry>(&scenario);
            
            assert_eq(get_total_poaps_minted(&poap_registry), 0);

            test::return_shared(poap_registry);
        };

        // Create event and get its ID
        let event_id = create_test_event(&mut scenario, b"Stats Test Event");

        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_poap_collection(
                &mut poap_registry,
                &global_registry,
                event_id,
                string::utf8(b"Stats POAP"),
                string::utf8(b"POAP for statistics testing"),
                string::utf8(b"stats-poap.png"),
                option::none(),
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(poap_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suilens_poap::E_NOT_AUTHORIZED)]
    fun test_update_collection_unauthorized_fails() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Alice creates event
        let event_id = create_test_event(&mut scenario, b"Alice's Event");
        let mut collection_id = object::id_from_address(@0x0);

        // Alice creates POAP collection
        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_poap_collection(
                &mut poap_registry,
                &global_registry,
                event_id,
                string::utf8(b"Alice's POAP"),
                string::utf8(b"Alice's POAP collection"),
                string::utf8(b"alice-poap.png"),
                option::none(),
                &clock,
                ctx(&mut scenario)
            );

            let collection_option = get_event_collection(&poap_registry, event_id);
            if (option::is_some(&collection_option)) {
                collection_id = *option::borrow(&collection_option);
            };

            test::return_shared(poap_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Bob tries to update Alice's collection (should fail)
        next_tx(&mut scenario, BOB);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);

            update_collection(
                &mut poap_registry,
                collection_id,
                string::utf8(b"Hacked POAP"),
                string::utf8(b"Bob trying to update"),
                string::utf8(b"hacked.png"),
                ctx(&mut scenario)
            );

            test::return_shared(poap_registry);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suilens_poap::E_ALREADY_CLAIMED)]
    fun test_create_duplicate_collection_fails() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create event and get its ID
        let event_id = create_test_event(&mut scenario, b"Single POAP Event");

        // Create first POAP collection
        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_poap_collection(
                &mut poap_registry,
                &global_registry,
                event_id,
                string::utf8(b"First POAP"),
                string::utf8(b"First collection"),
                string::utf8(b"first.png"),
                option::none(),
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(poap_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Try to create second POAP collection for same event (should fail)
        next_tx(&mut scenario, ALICE);
        {
            let mut poap_registry = test::take_shared<POAPRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_poap_collection(
                &mut poap_registry,
                &global_registry,
                event_id,
                string::utf8(b"Second POAP"),
                string::utf8(b"Duplicate collection"),
                string::utf8(b"second.png"),
                option::none(),
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(poap_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }
}