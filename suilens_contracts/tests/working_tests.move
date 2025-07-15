#[test_only]
#[allow(duplicate_alias)]
module suilens_contracts::working_tests {
    use std::string;
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use sui::test_utils::assert_eq;
    use sui::clock::{Self, Clock};
    use suilens_contracts::suilens_core::{Self, GlobalRegistry};
    use suilens_contracts::suilens_bounty::{Self, BountyRegistry};
    use suilens_contracts::suilens_poap::{Self, POAPRegistry};
    use suilens_contracts::suilens_community::{Self, CommunityRegistry};

    const ALICE: address = @0xA11CE;
    const BOB: address = @0xB0B;

    fun init_test(): Scenario {
        test::begin(ALICE)
    }

    fun setup_core_test(scenario: &mut Scenario) {
        // Initialize core module
        next_tx(scenario, ALICE);
        {
            suilens_core::init_for_testing(ctx(scenario));
        };

        // Create and share clock
        next_tx(scenario, ALICE);
        {
            clock::share_for_testing(clock::create_for_testing(ctx(scenario)));
        };
    }

    #[test]
    fun test_core_profile_creation() {
        let mut scenario = init_test();
        setup_core_test(&mut scenario);

        // Create profile
        next_tx(&mut scenario, ALICE);
        {
            let mut registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            suilens_core::create_profile(
                &mut registry,
                string::utf8(b"alice"),
                string::utf8(b"Test user"),
                string::utf8(b"alice.png"),
                &clock,
                ctx(&mut scenario)
            );

            // Verify profile was created
            assert!(suilens_core::has_user_profile(&registry, ALICE), 0);

            test::return_shared(registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    fun test_bounty_module_initialization() {
        let mut scenario = init_test();
        setup_core_test(&mut scenario);

        // Initialize bounty module
        next_tx(&mut scenario, ALICE);
        {
            suilens_bounty::init_for_testing(ctx(&mut scenario));
        };

        // Check initial state
        next_tx(&mut scenario, ALICE);
        {
            let bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            
            let (total_bounties, total_rewards, platform_balance) = 
                suilens_bounty::get_platform_stats(&bounty_registry);
            assert_eq(total_bounties, 0);
            assert_eq(total_rewards, 0);
            assert_eq(platform_balance, 0);

            test::return_shared(bounty_registry);
        };

        test::end(scenario);
    }

    #[test]
    fun test_poap_module_initialization() {
        let mut scenario = init_test();
        setup_core_test(&mut scenario);

        // Initialize POAP module
        next_tx(&mut scenario, ALICE);
        {
            suilens_poap::init_for_testing(ctx(&mut scenario));
        };

        // Check initial state
        next_tx(&mut scenario, ALICE);
        {
            let poap_registry = test::take_shared<POAPRegistry>(&scenario);
            
            assert_eq(suilens_poap::get_total_poaps_minted(&poap_registry), 0);

            test::return_shared(poap_registry);
        };

        test::end(scenario);
    }

    #[test]
    fun test_community_module_initialization() {
        let mut scenario = init_test();
        setup_core_test(&mut scenario);

        // Initialize community module
        next_tx(&mut scenario, ALICE);
        {
            suilens_community::init_for_testing(ctx(&mut scenario));
        };

        // Basic functionality test
        next_tx(&mut scenario, ALICE);
        {
            let community_registry = test::take_shared<CommunityRegistry>(&scenario);
            
            // Test that registry exists and is accessible
            let kenya_communities = suilens_community::get_regional_communities(
                &community_registry, 
                string::utf8(b"Kenya")
            );
            // Should be empty initially
            assert_eq(sui::vec_set::size(&kenya_communities), 0);

            test::return_shared(community_registry);
        };

        test::end(scenario);
    }

    #[test]
    fun test_event_creation() {
        let mut scenario = init_test();
        setup_core_test(&mut scenario);

        // Create profile first
        next_tx(&mut scenario, ALICE);
        {
            let mut registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            suilens_core::create_profile(
                &mut registry,
                string::utf8(b"alice"),
                string::utf8(b"Event organizer"),
                string::utf8(b"alice.png"),
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };

        // Create event
        next_tx(&mut scenario, ALICE);
        {
            let mut registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);
            let current_time = clock::timestamp_ms(&clock);

            suilens_core::create_event(
                &mut registry,
                string::utf8(b"Test Event"),
                string::utf8(b"A test event"),
                string::utf8(b"event.png"),
                current_time + 86400000, // Tomorrow
                current_time + 90000000, // Tomorrow + 1 hour
                string::utf8(b"Online"),
                string::utf8(b"technology"),
                std::option::some(100),
                0, // Free event
                false, // No approval required
                false, // Public event
                &clock,
                ctx(&mut scenario)
            );

            // Verify event was created
            let (events, users, _) = suilens_core::get_platform_stats(&registry);
            assert_eq(events, 1);
            assert_eq(users, 1);

            test::return_shared(registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suilens_core::E_ALREADY_REGISTERED)]
    fun test_duplicate_profile_fails() {
        let mut scenario = init_test();
        setup_core_test(&mut scenario);

        // Create first profile
        next_tx(&mut scenario, ALICE);
        {
            let mut registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            suilens_core::create_profile(
                &mut registry,
                string::utf8(b"alice"),
                string::utf8(b"First profile"),
                string::utf8(b"alice.png"),
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };

        // Try to create second profile (should fail)
        next_tx(&mut scenario, ALICE);
        {
            let mut registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            suilens_core::create_profile(
                &mut registry,
                string::utf8(b"alice2"),
                string::utf8(b"Second profile"),
                string::utf8(b"alice2.png"),
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    fun test_multi_user_profiles() {
        let mut scenario = init_test();
        setup_core_test(&mut scenario);

        // Alice creates profile
        next_tx(&mut scenario, ALICE);
        {
            let mut registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            suilens_core::create_profile(
                &mut registry,
                string::utf8(b"alice"),
                string::utf8(b"Alice's profile"),
                string::utf8(b"alice.png"),
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };

        // Bob creates profile
        next_tx(&mut scenario, BOB);
        {
            let mut registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            suilens_core::create_profile(
                &mut registry,
                string::utf8(b"bob"),
                string::utf8(b"Bob's profile"),
                string::utf8(b"bob.png"),
                &clock,
                ctx(&mut scenario)
            );

            // Verify both profiles exist
            assert!(suilens_core::has_user_profile(&registry, ALICE), 0);
            assert!(suilens_core::has_user_profile(&registry, BOB), 1);

            let (events, users, _) = suilens_core::get_platform_stats(&registry);
            assert_eq(events, 0);
            assert_eq(users, 2);

            test::return_shared(registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }
}