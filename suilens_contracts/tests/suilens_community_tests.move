#[test_only]
#[allow(duplicate_alias, unused_use, unused_const)]
module suilens_contracts::suilens_community_tests {
    use std::string;
    use std::option;
    use std::vector;
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use sui::test_utils::assert_eq;
    use sui::clock::{Self, Clock};
    use sui::vec_set;
    use sui::object;
    use sui::transfer;
    use suilens_contracts::suilens_core::{Self, GlobalRegistry};
    use suilens_contracts::suilens_community::{
        Self, CommunityRegistry,
        create_community, join_community, approve_join_request,
        leave_community, add_moderator, post_announcement,
        update_community, get_member_count, is_member,
        get_regional_communities, get_category_communities,
        get_user_communities, add_community_event
    };

    const ALICE: address = @0xA11CE;
    const BOB: address = @0xB0B;
    const CAROL: address = @0xCA201;
    const DAVE: address = @0xDA7E;

    fun init_test(): Scenario {
        test::begin(ALICE)
    }

    fun setup_test(scenario: &mut Scenario) {
        // Initialize core module
        next_tx(scenario, ALICE);
        {
            suilens_core::init_for_testing(ctx(scenario));
        };

        // Initialize community module
        next_tx(scenario, ALICE);
        {
            suilens_community::init_for_testing(ctx(scenario));
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
                string::utf8(b"Community admin"),
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
                string::utf8(b"Community member"),
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
                string::utf8(b"Community member"),
                string::utf8(b"carol.png"),
                &clock,
                ctx(scenario)
            );

            test::return_shared(registry);
            test::return_shared(clock);
        };
    }

    #[test]
    fun test_create_public_community() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create a public community
        next_tx(&mut scenario, ALICE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"Sui Developers Kenya"),
                string::utf8(b"A community for Sui developers in Kenya"),
                string::utf8(b"https://example.com/kenya-community.png"),
                string::utf8(b"Kenya"),
                string::utf8(b"regional"),
                false, // public community
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Verify regional index
        next_tx(&mut scenario, ALICE);
        {
            let community_registry = test::take_shared<CommunityRegistry>(&scenario);
            
            let kenya_communities = get_regional_communities(&community_registry, string::utf8(b"Kenya"));
            assert_eq(vec_set::size(&kenya_communities), 1);

            test::return_shared(community_registry);
        };

        test::end(scenario);
    }

    #[test]
    fun test_create_private_community() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create a private community
        next_tx(&mut scenario, ALICE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"Sui Core Contributors"),
                string::utf8(b"Private community for core contributors"),
                string::utf8(b"https://example.com/core-contributors.png"),
                string::utf8(b"Global"),
                string::utf8(b"development"),
                true, // private community
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    fun test_join_public_community() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create public community
        next_tx(&mut scenario, ALICE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"Gaming Community"),
                string::utf8(b"For blockchain gaming enthusiasts"),
                string::utf8(b"gaming.png"),
                string::utf8(b"Global"),
                string::utf8(b"gaming"),
                false, // public
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Note: For full testing, we would need to implement proper event ID handling
        // This is a simplified test

        test::end(scenario);
    }

    #[test]
    fun test_category_communities() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create multiple communities in different categories
        next_tx(&mut scenario, ALICE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            // Create gaming community
            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"GameFi Hub"),
                string::utf8(b"Blockchain gaming community"),
                string::utf8(b"gamefi.png"),
                string::utf8(b"Global"),
                string::utf8(b"gaming"),
                false,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        next_tx(&mut scenario, ALICE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            // Create another gaming community
            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"NFT Gamers"),
                string::utf8(b"NFT gaming enthusiasts"),
                string::utf8(b"nft-gamers.png"),
                string::utf8(b"Global"),
                string::utf8(b"gaming"),
                false,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Create development community
        next_tx(&mut scenario, ALICE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"Move Developers"),
                string::utf8(b"Move language developers"),
                string::utf8(b"move-dev.png"),
                string::utf8(b"Global"),
                string::utf8(b"development"),
                false,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Verify category indices
        next_tx(&mut scenario, ALICE);
        {
            let community_registry = test::take_shared<CommunityRegistry>(&scenario);
            
            let gaming_communities = get_category_communities(&community_registry, string::utf8(b"gaming"));
            assert_eq(vec_set::size(&gaming_communities), 2);

            let dev_communities = get_category_communities(&community_registry, string::utf8(b"development"));
            assert_eq(vec_set::size(&dev_communities), 1);

            test::return_shared(community_registry);
        };

        test::end(scenario);
    }

    #[test]
    fun test_regional_communities() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Create communities in different regions
        next_tx(&mut scenario, ALICE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"Sui Nigeria"),
                string::utf8(b"Nigerian Sui community"),
                string::utf8(b"nigeria.png"),
                string::utf8(b"Nigeria"),
                string::utf8(b"regional"),
                false,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        next_tx(&mut scenario, ALICE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"Sui Ghana"),
                string::utf8(b"Ghanaian Sui community"),
                string::utf8(b"ghana.png"),
                string::utf8(b"Ghana"),
                string::utf8(b"regional"),
                false,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Another Nigeria community
        next_tx(&mut scenario, ALICE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"Lagos Sui Devs"),
                string::utf8(b"Lagos-based developers"),
                string::utf8(b"lagos.png"),
                string::utf8(b"Nigeria"),
                string::utf8(b"regional"),
                false,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        // Verify regional indices
        next_tx(&mut scenario, ALICE);
        {
            let community_registry = test::take_shared<CommunityRegistry>(&scenario);
            
            let nigeria_communities = get_regional_communities(&community_registry, string::utf8(b"Nigeria"));
            assert_eq(vec_set::size(&nigeria_communities), 2);

            let ghana_communities = get_regional_communities(&community_registry, string::utf8(b"Ghana"));
            assert_eq(vec_set::size(&ghana_communities), 1);

            test::return_shared(community_registry);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suilens_community::E_PROFILE_NOT_FOUND)]
    fun test_create_community_without_profile_fails() {
        let mut scenario = init_test();
        
        // Initialize modules but don't create profile for Dave
        next_tx(&mut scenario, DAVE);
        {
            suilens_core::init_for_testing(ctx(&mut scenario));
        };

        next_tx(&mut scenario, DAVE);
        {
            suilens_community::init_for_testing(ctx(&mut scenario));
        };

        next_tx(&mut scenario, DAVE);
        {
            clock::share_for_testing(clock::create_for_testing(ctx(&mut scenario)));
        };

        // Try to create community without profile
        next_tx(&mut scenario, DAVE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"Invalid Community"),
                string::utf8(b"Should fail"),
                string::utf8(b"fail.png"),
                string::utf8(b"Global"),
                string::utf8(b"general"),
                false,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suilens_community::E_INVALID_CATEGORY)]
    fun test_create_community_invalid_category_fails() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Try to create community with invalid category
        next_tx(&mut scenario, ALICE);
        {
            let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
            let global_registry = test::take_shared<GlobalRegistry>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);

            create_community(
                &mut community_registry,
                &global_registry,
                string::utf8(b"Invalid Category Community"),
                string::utf8(b"This should fail"),
                string::utf8(b"invalid.png"),
                string::utf8(b"Global"),
                string::utf8(b"invalid_category"), // Invalid category
                false,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(community_registry);
            test::return_shared(global_registry);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    fun test_valid_categories() {
        let mut scenario = init_test();
        setup_test(&mut scenario);

        // Test all valid categories
        let categories = vector[
            string::utf8(b"regional"),
            string::utf8(b"gaming"),
            string::utf8(b"development"),
            string::utf8(b"general")
        ];

        let mut i = 0;
        while (i < 4) {
            let category = *vector::borrow(&categories, i);
            
            next_tx(&mut scenario, ALICE);
            {
                let mut community_registry = test::take_shared<CommunityRegistry>(&scenario);
                let global_registry = test::take_shared<GlobalRegistry>(&scenario);
                let clock = test::take_shared<Clock>(&scenario);

                let mut name = string::utf8(b"Test Community ");
                string::append(&mut name, category);

                create_community(
                    &mut community_registry,
                    &global_registry,
                    name,
                    string::utf8(b"Testing category"),
                    string::utf8(b"test.png"),
                    string::utf8(b"Global"),
                    category,
                    false,
                    &clock,
                    ctx(&mut scenario)
                );

                test::return_shared(community_registry);
                test::return_shared(global_registry);
                test::return_shared(clock);
            };
            
            i = i + 1;
        };

        test::end(scenario);
    }
}