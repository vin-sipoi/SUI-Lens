#[test_only]
#[allow(duplicate_alias, unused_use, unused_const)]
module suilens_contracts::simple_tests {
    use std::string;
    use std::option;
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use sui::test_utils::assert_eq;
    use sui::clock::{Self, Clock};
    use sui::transfer;
    use suilens_contracts::suilens_core::{Self, GlobalRegistry};

    const ALICE: address = @0xA11CE;
    const BOB: address = @0xB0B;

    fun init_test(): Scenario {
        test::begin(ALICE)
    }

    #[test]
    fun test_profile_creation() {
        let mut scenario = init_test();
        
        // Initialize core module
        next_tx(&mut scenario, ALICE);
        {
            suilens_core::init_for_testing(ctx(&mut scenario));
        };

        // Create and share clock
        next_tx(&mut scenario, ALICE);
        {
            clock::share_for_testing(clock::create_for_testing(ctx(&mut scenario)));
        };

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
    fun test_event_creation() {
        let mut scenario = init_test();
        
        // Initialize core module
        next_tx(&mut scenario, ALICE);
        {
            suilens_core::init_for_testing(ctx(&mut scenario));
        };

        // Create and share clock
        next_tx(&mut scenario, ALICE);
        {
            clock::share_for_testing(clock::create_for_testing(ctx(&mut scenario)));
        };

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
                string::utf8(b"This is a test event"),
                string::utf8(b"event.png"),
                current_time + 86400000, // Tomorrow
                current_time + 90000000, // Tomorrow + 1 hour
                string::utf8(b"Online"),
                string::utf8(b"technology"),
                option::some(100),
                0, // Free event
                false, // No approval required
                false, // Public event
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suilens_core::E_ALREADY_REGISTERED)]
    fun test_duplicate_profile_fails() {
        let mut scenario = init_test();
        
        // Initialize core module
        next_tx(&mut scenario, ALICE);
        {
            suilens_core::init_for_testing(ctx(&mut scenario));
        };

        // Create and share clock
        next_tx(&mut scenario, ALICE);
        {
            clock::share_for_testing(clock::create_for_testing(ctx(&mut scenario)));
        };

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
}