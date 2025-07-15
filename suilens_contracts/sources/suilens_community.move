/// SuilensCommunity: Community and regional group management
#[allow(duplicate_alias, unused_const, unused_use)]
module suilens_contracts::suilens_community {
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
    use suilens_contracts::suilens_core::{Self, GlobalRegistry};

    // ======== Error Constants ========
    const E_NOT_AUTHORIZED: u64 = 0;
    const E_COMMUNITY_NOT_FOUND: u64 = 1;
    const E_ALREADY_MEMBER: u64 = 2;
    const E_NOT_MEMBER: u64 = 3;
    const E_COMMUNITY_EXISTS: u64 = 4;
    const E_INVALID_CATEGORY: u64 = 5;
    const E_PROFILE_NOT_FOUND: u64 = 6;

    // ======== Structs ========

    /// Community structure
    public struct Community has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        region: String,
        category: String, // "regional", "gaming", "development", "general"
        admin: address,
        moderators: VecSet<address>,
        members: VecSet<address>,
        events: VecSet<ID>,
        announcements: VecSet<ID>,
        is_active: bool,
        is_private: bool,
        join_requests: VecSet<address>,
        metadata: VecMap<String, String>,
        created_at: u64,
        updated_at: u64,
    }

    /// Community announcement
    public struct Announcement has key, store {
        id: UID,
        community_id: ID,
        author: address,
        title: String,
        content: String,
        created_at: u64,
    }

    /// Community registry
    public struct CommunityRegistry has key {
        id: UID,
        communities: Table<ID, Community>,
        regional_communities: Table<String, VecSet<ID>>, // region -> community IDs
        category_communities: Table<String, VecSet<ID>>, // category -> community IDs
        user_communities: Table<address, VecSet<ID>>, // user -> joined communities
        total_communities: u64,
    }

    // ======== Events ========

    public struct CommunityCreated has copy, drop {
        community_id: ID,
        name: String,
        region: String,
        category: String,
        admin: address,
    }

    public struct MemberJoined has copy, drop {
        community_id: ID,
        member: address,
        member_count: u64,
    }

    public struct MemberLeft has copy, drop {
        community_id: ID,
        member: address,
        member_count: u64,
    }

    public struct AnnouncementPosted has copy, drop {
        announcement_id: ID,
        community_id: ID,
        author: address,
        title: String,
    }

    // ======== Init Function ========

    fun init(ctx: &mut TxContext) {
        let community_registry = CommunityRegistry {
            id: object::new(ctx),
            communities: table::new(ctx),
            regional_communities: table::new(ctx),
            category_communities: table::new(ctx),
            user_communities: table::new(ctx),
            total_communities: 0,
        };

        transfer::share_object(community_registry);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    // ======== Community Management Functions ========

    /// Create a new community
    public fun create_community(
        registry: &mut CommunityRegistry,
        global_registry: &GlobalRegistry,
        name: String,
        description: String,
        image_url: String,
        region: String,
        category: String,
        is_private: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let admin = tx_context::sender(ctx);
        
        // Verify user has a profile
        assert!(suilens_core::has_user_profile(global_registry, admin), E_PROFILE_NOT_FOUND);
        
        // Validate category
        assert!(
            category == string::utf8(b"regional") || 
            category == string::utf8(b"gaming") || 
            category == string::utf8(b"development") || 
            category == string::utf8(b"general"),
            E_INVALID_CATEGORY
        );

        let community_id = object::new(ctx);
        let community_id_copy = object::uid_to_inner(&community_id);
        let current_time = clock::timestamp_ms(clock);

        let community = Community {
            id: community_id,
            name,
            description,
            image_url,
            region,
            category,
            admin,
            moderators: vec_set::empty(),
            members: vec_set::singleton(admin),
            events: vec_set::empty(),
            announcements: vec_set::empty(),
            is_active: true,
            is_private,
            join_requests: vec_set::empty(),
            metadata: vec_map::empty(),
            created_at: current_time,
            updated_at: current_time,
        };

        // Add to regional index
        if (!table::contains(&registry.regional_communities, region)) {
            table::add(&mut registry.regional_communities, region, vec_set::empty());
        };
        let regional_set = table::borrow_mut(&mut registry.regional_communities, region);
        vec_set::insert(regional_set, community_id_copy);

        // Add to category index
        if (!table::contains(&registry.category_communities, category)) {
            table::add(&mut registry.category_communities, category, vec_set::empty());
        };
        let category_set = table::borrow_mut(&mut registry.category_communities, category);
        vec_set::insert(category_set, community_id_copy);

        // Add to user's communities
        if (!table::contains(&registry.user_communities, admin)) {
            table::add(&mut registry.user_communities, admin, vec_set::empty());
        };
        let user_communities = table::borrow_mut(&mut registry.user_communities, admin);
        vec_set::insert(user_communities, community_id_copy);

        event::emit(CommunityCreated {
            community_id: community_id_copy,
            name: community.name,
            region: community.region,
            category: community.category,
            admin,
        });

        // Add to registry
        table::add(&mut registry.communities, community_id_copy, community);
        registry.total_communities = registry.total_communities + 1;
    }

    /// Join a community
    public fun join_community(
        registry: &mut CommunityRegistry,
        global_registry: &mut GlobalRegistry,
        community_id: ID,
        ctx: &mut TxContext
    ) {
        let member = tx_context::sender(ctx);
        
        // Verify user has a profile
        assert!(suilens_core::has_user_profile(global_registry, member), E_PROFILE_NOT_FOUND);
        
        assert!(table::contains(&registry.communities, community_id), E_COMMUNITY_NOT_FOUND);
        let community = table::borrow_mut(&mut registry.communities, community_id);
        
        assert!(!vec_set::contains(&community.members, &member), E_ALREADY_MEMBER);

        if (community.is_private) {
            // Add to join requests for private communities
            vec_set::insert(&mut community.join_requests, member);
        } else {
            // Direct join for public communities
            vec_set::insert(&mut community.members, member);
            
            // Add to user's communities
            if (!table::contains(&registry.user_communities, member)) {
                table::add(&mut registry.user_communities, member, vec_set::empty());
            };
            let user_communities = table::borrow_mut(&mut registry.user_communities, member);
            vec_set::insert(user_communities, community_id);

            // Update user profile
            suilens_core::add_user_community(global_registry, member, community_id);

            event::emit(MemberJoined {
                community_id,
                member,
                member_count: vec_set::size(&community.members),
            });
        }
    }

    /// Approve join request (admin/moderator only)
    public fun approve_join_request(
        registry: &mut CommunityRegistry,
        global_registry: &mut GlobalRegistry,
        community_id: ID,
        member: address,
        ctx: &mut TxContext
    ) {
        let approver = tx_context::sender(ctx);
        assert!(table::contains(&registry.communities, community_id), E_COMMUNITY_NOT_FOUND);
        
        let community = table::borrow_mut(&mut registry.communities, community_id);
        assert!(
            community.admin == approver || 
            vec_set::contains(&community.moderators, &approver),
            E_NOT_AUTHORIZED
        );
        
        assert!(vec_set::contains(&community.join_requests, &member), E_NOT_MEMBER);
        
        // Remove from requests and add to members
        vec_set::remove(&mut community.join_requests, &member);
        vec_set::insert(&mut community.members, member);
        
        // Add to user's communities
        if (!table::contains(&registry.user_communities, member)) {
            table::add(&mut registry.user_communities, member, vec_set::empty());
        };
        let user_communities = table::borrow_mut(&mut registry.user_communities, member);
        vec_set::insert(user_communities, community_id);

        // Update user profile
        suilens_core::add_user_community(global_registry, member, community_id);

        event::emit(MemberJoined {
            community_id,
            member,
            member_count: vec_set::size(&community.members),
        });
    }

    /// Leave a community
    public fun leave_community(
        registry: &mut CommunityRegistry,
        global_registry: &mut GlobalRegistry,
        community_id: ID,
        ctx: &mut TxContext
    ) {
        let member = tx_context::sender(ctx);
        assert!(table::contains(&registry.communities, community_id), E_COMMUNITY_NOT_FOUND);
        
        let community = table::borrow_mut(&mut registry.communities, community_id);
        assert!(vec_set::contains(&community.members, &member), E_NOT_MEMBER);
        assert!(community.admin != member, E_NOT_AUTHORIZED); // Admin cannot leave
        
        // Remove from members
        vec_set::remove(&mut community.members, &member);
        
        // Remove from moderators if applicable
        if (vec_set::contains(&community.moderators, &member)) {
            vec_set::remove(&mut community.moderators, &member);
        };
        
        // Remove from user's communities
        let user_communities = table::borrow_mut(&mut registry.user_communities, member);
        vec_set::remove(user_communities, &community_id);

        // Update user profile
        suilens_core::remove_user_community(global_registry, member, community_id);

        event::emit(MemberLeft {
            community_id,
            member,
            member_count: vec_set::size(&community.members),
        });
    }

    /// Add moderator (admin only)
    public fun add_moderator(
        registry: &mut CommunityRegistry,
        community_id: ID,
        moderator: address,
        ctx: &mut TxContext
    ) {
        let admin = tx_context::sender(ctx);
        assert!(table::contains(&registry.communities, community_id), E_COMMUNITY_NOT_FOUND);
        
        let community = table::borrow_mut(&mut registry.communities, community_id);
        assert!(community.admin == admin, E_NOT_AUTHORIZED);
        assert!(vec_set::contains(&community.members, &moderator), E_NOT_MEMBER);
        
        vec_set::insert(&mut community.moderators, moderator);
    }

    /// Post announcement (admin/moderator only)
    public fun post_announcement(
        registry: &mut CommunityRegistry,
        community_id: ID,
        title: String,
        content: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let author = tx_context::sender(ctx);
        assert!(table::contains(&registry.communities, community_id), E_COMMUNITY_NOT_FOUND);
        
        let community = table::borrow_mut(&mut registry.communities, community_id);
        assert!(
            community.admin == author || 
            vec_set::contains(&community.moderators, &author),
            E_NOT_AUTHORIZED
        );

        let announcement_id = object::new(ctx);
        let announcement_id_copy = object::uid_to_inner(&announcement_id);

        let announcement = Announcement {
            id: announcement_id,
            community_id,
            author,
            title,
            content,
            created_at: clock::timestamp_ms(clock),
        };

        event::emit(AnnouncementPosted {
            announcement_id: announcement_id_copy,
            community_id,
            author,
            title: announcement.title,
        });

        vec_set::insert(&mut community.announcements, announcement_id_copy);
        transfer::share_object(announcement);
    }

    /// Add event to community
    public fun add_community_event(
        registry: &mut CommunityRegistry,
        community_id: ID,
        event_id: ID,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&registry.communities, community_id), E_COMMUNITY_NOT_FOUND);
        
        let community = table::borrow_mut(&mut registry.communities, community_id);
        assert!(
            community.admin == sender || 
            vec_set::contains(&community.moderators, &sender),
            E_NOT_AUTHORIZED
        );
        
        vec_set::insert(&mut community.events, event_id);
    }

    /// Update community details (admin only)
    public fun update_community(
        registry: &mut CommunityRegistry,
        community_id: ID,
        name: String,
        description: String,
        image_url: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let admin = tx_context::sender(ctx);
        assert!(table::contains(&registry.communities, community_id), E_COMMUNITY_NOT_FOUND);
        
        let community = table::borrow_mut(&mut registry.communities, community_id);
        assert!(community.admin == admin, E_NOT_AUTHORIZED);
        
        community.name = name;
        community.description = description;
        community.image_url = image_url;
        community.updated_at = clock::timestamp_ms(clock);
    }

    // ======== View Functions ========

    /// Get community details
    public fun get_community(registry: &CommunityRegistry, community_id: ID): &Community {
        table::borrow(&registry.communities, community_id)
    }

    /// Get communities by region
    public fun get_regional_communities(registry: &CommunityRegistry, region: String): VecSet<ID> {
        if (table::contains(&registry.regional_communities, region)) {
            *table::borrow(&registry.regional_communities, region)
        } else {
            vec_set::empty()
        }
    }

    /// Get communities by category
    public fun get_category_communities(registry: &CommunityRegistry, category: String): VecSet<ID> {
        if (table::contains(&registry.category_communities, category)) {
            *table::borrow(&registry.category_communities, category)
        } else {
            vec_set::empty()
        }
    }

    /// Get user's communities
    public fun get_user_communities(registry: &CommunityRegistry, user: address): VecSet<ID> {
        if (table::contains(&registry.user_communities, user)) {
            *table::borrow(&registry.user_communities, user)
        } else {
            vec_set::empty()
        }
    }

    /// Check if user is member
    public fun is_member(registry: &CommunityRegistry, community_id: ID, user: address): bool {
        if (!table::contains(&registry.communities, community_id)) {
            return false
        };
        let community = table::borrow(&registry.communities, community_id);
        vec_set::contains(&community.members, &user)
    }

    /// Get member count
    public fun get_member_count(registry: &CommunityRegistry, community_id: ID): u64 {
        let community = table::borrow(&registry.communities, community_id);
        vec_set::size(&community.members)
    }
}