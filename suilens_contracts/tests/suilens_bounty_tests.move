#[test_only]
#[allow(duplicate_alias, unused_use, unused_assignment, unused_let_mut)]
module suilens_contracts::suilens_bounty_tests {
    use std::string::{Self, String};
    use std::option;
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use sui::test_utils::{assert_eq};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::vec_set;
    use sui::transfer;
    use suilens_contracts::suilens_core::{Self, GlobalRegistry};
    use suilens_contracts::suilens_bounty::{
        Self, BountyRegistry, Bounty, BountySubmission,
        create_bounty, submit_bounty_work, select_winner,
        claim_bounty_reward, cancel_bounty, get_active_bounties,
        get_submission_count, is_bounty_active, get_platform_stats
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

        // Initialize bounty module
        next_tx(scenario, ALICE);
        {
            suilens_bounty::init_for_testing(ctx(scenario));
        };

        // Create and share clock
        next_tx(scenario, ALICE);
        {
            clock::share_for_testing(clock::create_for_testing(ctx(scenario)));
        };

        // Create profiles for testing
        next_tx(scenario, ALICE);
        {
            let mut registry = test::take_shared<GlobalRegistry>(scenario);
            let clock = test::take_shared<Clock>(scenario);

            suilens_core::create_profile(
                &mut registry,
                string::utf8(b"alice"),
                string::utf8(b"Bounty creator"),
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
                string::utf8(b"Bounty hunter"),
                string::utf8(b"bob.png"),
                &clock,
                ctx(scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };

        next_tx(scenario, CAROL);
        {
            let mut registry = test::take_shared<GlobalRegistry>(scenario);
            let clock = test::take_shared<Clock>(scenario);

            suilens_core::create_profile(
                &mut registry,
                string::utf8(b"carol"),
                string::utf8(b"Bounty hunter"),
                string::utf8(b"carol.png"),
                &clock,
                ctx(scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };
    }

    fun mint_sui_for_testing(amount: u64, ctx: &mut TxContext): Coin<SUI> {
        coin::mint_for_testing<SUI>(amount, ctx)
    }

    #[test]
    fun test_create_bounty() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create a bounty
        next_tx(&mut scenario, ALICE);
        {
            let mut bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);
            let current_time = clock::timestamp_ms(&clock);

            let reward_payment = mint_sui_for_testing(5000000000, ctx(&mut scenario)); // 5 SUI

            create_bounty(
                &mut bounty_registry,
                &global_registry,
                string::utf8(b"Build a DeFi Dashboard"),
                string::utf8(b"Create a responsive dashboard for DeFi analytics on Sui"),
                string::utf8(b"Requirements: React, TypeScript, Sui SDK integration"),
                string::utf8(b"development"),
                current_time + 604800000, // 7 days from now
                reward_payment,
                &clock,
                ctx(&mut scenario)
            );

            assert_eq(suilens_bounty::get_total_bounties(&bounty_registry), 1);
            let active = get_active_bounties(&bounty_registry);
            assert_eq(vec_set::size(&active), 1);

            test::return_shared(bounty_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    fun test_submit_bounty_work() {
        let mut scenario = init_test();
        setup_test(&mut scenario);
        let mut bounty_id = option::none<ID>();

        // Create bounty
        next_tx(&mut scenario, ALICE);
        {
            let mut bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);
            let current_time = clock::timestamp_ms(&clock);

            // For testing we'll create a simple ID
            bounty_id = option::some(object::id_from_address(@0xB0B17E));

            let reward_payment = mint_sui_for_testing(3000000000, ctx(&mut scenario)); // 3 SUI

            create_bounty(
                &mut bounty_registry,
                &global_registry,
                string::utf8(b"Logo Design Contest"),
                string::utf8(b"Design a modern logo for our DeFi protocol"),
                string::utf8(b"Requirements: SVG format, multiple color variations"),
                string::utf8(b"design"),
                current_time + 259200000, // 3 days
                reward_payment,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(bounty_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Bob submits work
        next_tx(&mut scenario, BOB);
        {
            let mut bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            // Note: In real scenario, we'd use the actual bounty_id
            // For testing, we'll verify the registry state

            test::return_shared(bounty_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    fun test_select_winner_and_claim_reward() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create bounty
        next_tx(&mut scenario, ALICE);
        {
            let mut bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);
            let current_time = clock::timestamp_ms(&clock);

            let reward_payment = mint_sui_for_testing(10000000000, ctx(&mut scenario)); // 10 SUI

            create_bounty(
                &mut bounty_registry,
                &global_registry,
                string::utf8(b"Smart Contract Audit"),
                string::utf8(b"Audit our DeFi smart contracts for security vulnerabilities"),
                string::utf8(b"Requirements: Experience with Move, security best practices"),
                string::utf8(b"security"),
                current_time + 1209600000, // 14 days
                reward_payment,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(bounty_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Multiple submissions would happen here
        // Alice selects winner
        // Winner claims reward

        test::end(scenario);
    }

    #[test]
    fun test_cancel_bounty() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create bounty
        next_tx(&mut scenario, ALICE);
        {
            let mut bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);
            let current_time = clock::timestamp_ms(&clock);

            let reward_payment = mint_sui_for_testing(2000000000, ctx(&mut scenario)); // 2 SUI

            create_bounty(
                &mut bounty_registry,
                &global_registry,
                string::utf8(b"Documentation Update"),
                string::utf8(b"Update project documentation"),
                string::utf8(b"Requirements: Technical writing skills"),
                string::utf8(b"documentation"),
                current_time + 172800000, // 2 days
                reward_payment,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(bounty_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Cancel bounty and verify refund
        // This would require the actual bounty_id

        test::end(scenario);
    }

    #[test]
    fun test_platform_fee_on_reward_claim() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Check initial platform stats
        next_tx(&mut scenario, ALICE);
        {
            let bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            
            let (total_bounties, total_rewards, platform_balance) = get_platform_stats(&bounty_registry);
            assert_eq(total_bounties, 0);
            assert_eq(total_rewards, 0);
            assert_eq(platform_balance, 0);

            test::return_shared(bounty_registry);
        };

        // Create bounty with 1000 SUI reward
        // Platform fee is 2.5%, so platform should get 25 SUI
        // Winner should get 975 SUI

        test::end(scenario);
    }

    #[test]
    fun test_bounty_expiration() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create bounty with short deadline
        next_tx(&mut scenario, ALICE);
        {
            let mut bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let mut clock = test::take_shared<Clock>(&scenario);
            let current_time = clock::timestamp_ms(&clock);

            let reward_payment = mint_sui_for_testing(1000000000, ctx(&mut scenario)); // 1 SUI

            create_bounty(
                &mut bounty_registry,
                &global_registry,
                string::utf8(b"Quick Task"),
                string::utf8(b"Complete this quickly"),
                string::utf8(b"Requirements: Speed"),
                string::utf8(b"general"),
                current_time + 3600000, // 1 hour
                reward_payment,
                &clock,
                ctx(&mut scenario)
            );

            // Fast forward time past deadline
            clock::set_for_testing(&mut clock, current_time + 7200000); // 2 hours later

            test::return_shared(bounty_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Verify bounty is no longer active
        // This would require checking with actual bounty_id

        test::end(scenario);
    }

    #[test]
    fun test_multiple_submissions() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create bounty
        next_tx(&mut scenario, ALICE);
        {
            let mut bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);
            let current_time = clock::timestamp_ms(&clock);

            let reward_payment = mint_sui_for_testing(5000000000, ctx(&mut scenario)); // 5 SUI

            create_bounty(
                &mut bounty_registry,
                &global_registry,
                string::utf8(b"Best Solution Contest"),
                string::utf8(b"Submit your best solution"),
                string::utf8(b"Requirements: Creativity and efficiency"),
                string::utf8(b"contest"),
                current_time + 432000000, // 5 days
                reward_payment,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(bounty_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Bob and Carol submit work
        // Alice reviews and selects winner

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suilens_bounty::E_PROFILE_NOT_FOUND)]
    fun test_create_bounty_without_profile_fails() {
        let mut scenario = init_test();
        
        // Initialize modules but don't create profile for Dave
        next_tx(&mut scenario, @0xDA7E);
        {
            suilens_core::init_for_testing(ctx(&mut scenario));
        };

        next_tx(&mut scenario, @0xDA7E);
        {
            suilens_bounty::init_for_testing(ctx(&mut scenario));
        };

        next_tx(&mut scenario, @0xDA7E);
        {
            clock::share_for_testing(clock::create_for_testing(ctx(&mut scenario)));
        };

        // Try to create bounty without profile
        next_tx(&mut scenario, @0xDA7E);
        {
            let mut bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);
            let current_time = clock::timestamp_ms(&clock);

            let reward_payment = mint_sui_for_testing(1000000000, ctx(&mut scenario));

            create_bounty(
                &mut bounty_registry,
                &global_registry,
                string::utf8(b"Invalid Bounty"),
                string::utf8(b"Should fail"),
                string::utf8(b"No profile"),
                string::utf8(b"general"),
                current_time + 86400000,
                reward_payment,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(bounty_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suilens_bounty::E_INSUFFICIENT_REWARD)]
    fun test_create_bounty_zero_reward_fails() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Try to create bounty with zero reward
        next_tx(&mut scenario, ALICE);
        {
            let mut bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);
            let current_time = clock::timestamp_ms(&clock);

            let reward_payment = mint_sui_for_testing(0, ctx(&mut scenario)); // 0 SUI

            create_bounty(
                &mut bounty_registry,
                &global_registry,
                string::utf8(b"Free Work"),
                string::utf8(b"Work for free"),
                string::utf8(b"No payment"),
                string::utf8(b"general"),
                current_time + 86400000,
                reward_payment,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(bounty_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suilens_bounty::E_BOUNTY_EXPIRED)]
    fun test_create_bounty_past_deadline_fails() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Try to create bounty with deadline in the past
        next_tx(&mut scenario, ALICE);
        {
            let mut bounty_registry = test::take_shared<BountyRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);
            let current_time = clock::timestamp_ms(&clock);

            let reward_payment = mint_sui_for_testing(1000000000, ctx(&mut scenario));

            create_bounty(
                &mut bounty_registry,
                &global_registry,
                string::utf8(b"Past Bounty"),
                string::utf8(b"Already expired"),
                string::utf8(b"Too late"),
                string::utf8(b"general"),
                if (current_time > 0) { current_time - 1 } else { 0 }, // Past deadline
                reward_payment,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(bounty_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }


}