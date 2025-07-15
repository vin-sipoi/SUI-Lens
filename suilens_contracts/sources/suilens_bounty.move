/// SuilensBounty: Bounty and grant tracking system with SUI rewards
#[allow(duplicate_alias, unused_const, lint(self_transfer))]
module suilens_contracts::suilens_bounty {
    use std::string::{String};
    use std::option::{Self, Option};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use sui::vec_map::{Self, VecMap};
    use suilens_contracts::suilens_core::{Self, GlobalRegistry};

    // ======== Error Constants ========
    const E_NOT_AUTHORIZED: u64 = 0;
    const E_BOUNTY_NOT_FOUND: u64 = 1;
    const E_SUBMISSION_NOT_FOUND: u64 = 2;
    const E_ALREADY_SUBMITTED: u64 = 3;
    const E_BOUNTY_EXPIRED: u64 = 4;
    const E_BOUNTY_NOT_ACTIVE: u64 = 5;
    const E_INSUFFICIENT_REWARD: u64 = 6;
    const E_ALREADY_CLAIMED: u64 = 7;
    const E_NOT_WINNER: u64 = 8;
    const E_PROFILE_NOT_FOUND: u64 = 9;
    const E_INVALID_STATUS: u64 = 10;

    // ======== Constants ========
    const STATUS_OPEN: u8 = 0;
    const STATUS_IN_PROGRESS: u8 = 1;
    const STATUS_COMPLETED: u8 = 2;
    const STATUS_CANCELLED: u8 = 3;

    // ======== Structs ========

    /// Bounty structure
    public struct Bounty has key, store {
        id: UID,
        creator: address,
        title: String,
        description: String,
        requirements: String,
        category: String,
        reward_balance: Balance<SUI>,
        reward_amount: u64,
        deadline: u64,
        status: u8,
        submissions: VecSet<ID>,
        winner: Option<address>,
        winner_submission_id: Option<ID>,
        metadata: VecMap<String, String>,
        created_at: u64,
        completed_at: Option<u64>,
    }

    /// Bounty submission
    public struct BountySubmission has key, store {
        id: UID,
        bounty_id: ID,
        submitter: address,
        submission_url: String,
        description: String,
        twitter_link: Option<String>,
        metadata: VecMap<String, String>,
        submitted_at: u64,
        is_winner: bool,
    }

    /// Bounty registry
    public struct BountyRegistry has key {
        id: UID,
        bounties: Table<ID, Bounty>,
        submissions: Table<ID, BountySubmission>,
        user_bounties: Table<address, VecSet<ID>>, // created bounties
        user_submissions: Table<address, VecSet<ID>>, // submitted to bounties
        active_bounties: VecSet<ID>,
        total_bounties: u64,
        total_rewards_distributed: u64,
        platform_fee_rate: u64, // basis points (100 = 1%)
        platform_balance: Balance<SUI>,
    }

    // ======== Events ========

    public struct BountyCreated has copy, drop {
        bounty_id: ID,
        creator: address,
        title: String,
        reward_amount: u64,
        deadline: u64,
    }

    public struct BountySubmitted has copy, drop {
        submission_id: ID,
        bounty_id: ID,
        submitter: address,
    }

    public struct WinnerSelected has copy, drop {
        bounty_id: ID,
        winner: address,
        submission_id: ID,
        reward_amount: u64,
    }

    public struct BountyCancelled has copy, drop {
        bounty_id: ID,
        creator: address,
        refund_amount: u64,
    }

    public struct RewardClaimed has copy, drop {
        bounty_id: ID,
        winner: address,
        amount: u64,
    }

    // ======== Init Function ========

    fun init(ctx: &mut TxContext) {
        let bounty_registry = BountyRegistry {
            id: object::new(ctx),
            bounties: table::new(ctx),
            submissions: table::new(ctx),
            user_bounties: table::new(ctx),
            user_submissions: table::new(ctx),
            active_bounties: vec_set::empty(),
            total_bounties: 0,
            total_rewards_distributed: 0,
            platform_fee_rate: 250, // 2.5%
            platform_balance: balance::zero(),
        };

        transfer::share_object(bounty_registry);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    // ======== Bounty Management Functions ========

    /// Create a new bounty
    public fun create_bounty(
        registry: &mut BountyRegistry,
        global_registry: &GlobalRegistry,
        title: String,
        description: String,
        requirements: String,
        category: String,
        deadline: u64,
        reward_payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        // Verify user has a profile
        assert!(suilens_core::has_user_profile(global_registry, creator), E_PROFILE_NOT_FOUND);
        
        // Validate deadline
        assert!(deadline > current_time, E_BOUNTY_EXPIRED);
        
        // Validate reward amount
        let reward_amount = coin::value(&reward_payment);
        assert!(reward_amount > 0, E_INSUFFICIENT_REWARD);

        let bounty_id = object::new(ctx);
        let bounty_id_copy = object::uid_to_inner(&bounty_id);

        let bounty = Bounty {
            id: bounty_id,
            creator,
            title,
            description,
            requirements,
            category,
            reward_balance: coin::into_balance(reward_payment),
            reward_amount,
            deadline,
            status: STATUS_OPEN,
            submissions: vec_set::empty(),
            winner: option::none(),
            winner_submission_id: option::none(),
            metadata: vec_map::empty(),
            created_at: current_time,
            completed_at: option::none(),
        };

        // Add to user's created bounties
        if (!table::contains(&registry.user_bounties, creator)) {
            table::add(&mut registry.user_bounties, creator, vec_set::empty());
        };
        let user_bounties = table::borrow_mut(&mut registry.user_bounties, creator);
        vec_set::insert(user_bounties, bounty_id_copy);

        // Add to active bounties
        vec_set::insert(&mut registry.active_bounties, bounty_id_copy);

        event::emit(BountyCreated {
            bounty_id: bounty_id_copy,
            creator,
            title: bounty.title,
            reward_amount,
            deadline,
        });

        // Add to registry
        table::add(&mut registry.bounties, bounty_id_copy, bounty);
        registry.total_bounties = registry.total_bounties + 1;
    }

    /// Submit work for a bounty
    public fun submit_bounty_work(
        registry: &mut BountyRegistry,
        global_registry: &GlobalRegistry,
        bounty_id: ID,
        submission_url: String,
        description: String,
        twitter_link: Option<String>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let submitter = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        // Verify user has a profile
        assert!(suilens_core::has_user_profile(global_registry, submitter), E_PROFILE_NOT_FOUND);
        
        assert!(table::contains(&registry.bounties, bounty_id), E_BOUNTY_NOT_FOUND);
        let bounty = table::borrow_mut(&mut registry.bounties, bounty_id);
        
        // Validate bounty state
        assert!(bounty.status == STATUS_OPEN || bounty.status == STATUS_IN_PROGRESS, E_BOUNTY_NOT_ACTIVE);
        assert!(current_time < bounty.deadline, E_BOUNTY_EXPIRED);
        
        // Create submission
        let submission_id = object::new(ctx);
        let submission_id_copy = object::uid_to_inner(&submission_id);

        let submission = BountySubmission {
            id: submission_id,
            bounty_id,
            submitter,
            submission_url,
            description,
            twitter_link,
            metadata: vec_map::empty(),
            submitted_at: current_time,
            is_winner: false,
        };

        // Update bounty
        vec_set::insert(&mut bounty.submissions, submission_id_copy);
        if (bounty.status == STATUS_OPEN) {
            bounty.status = STATUS_IN_PROGRESS;
        };

        // Add to user's submissions
        if (!table::contains(&registry.user_submissions, submitter)) {
            table::add(&mut registry.user_submissions, submitter, vec_set::empty());
        };
        let user_submissions = table::borrow_mut(&mut registry.user_submissions, submitter);
        vec_set::insert(user_submissions, bounty_id);

        // Add submission to registry
        table::add(&mut registry.submissions, submission_id_copy, submission);

        event::emit(BountySubmitted {
            submission_id: submission_id_copy,
            bounty_id,
            submitter,
        });
    }

    /// Select winner for a bounty (creator only)
    public fun select_winner(
        registry: &mut BountyRegistry,
        bounty_id: ID,
        submission_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        assert!(table::contains(&registry.bounties, bounty_id), E_BOUNTY_NOT_FOUND);
        
        let bounty = table::borrow_mut(&mut registry.bounties, bounty_id);
        assert!(bounty.creator == creator, E_NOT_AUTHORIZED);
        assert!(bounty.status == STATUS_IN_PROGRESS, E_INVALID_STATUS);
        assert!(vec_set::contains(&bounty.submissions, &submission_id), E_SUBMISSION_NOT_FOUND);
        
        // Get submission details
        let submission = table::borrow_mut(&mut registry.submissions, submission_id);
        submission.is_winner = true;
        
        // Update bounty
        bounty.winner = option::some(submission.submitter);
        bounty.winner_submission_id = option::some(submission_id);
        bounty.status = STATUS_COMPLETED;
        bounty.completed_at = option::some(clock::timestamp_ms(clock));
        
        // Remove from active bounties
        vec_set::remove(&mut registry.active_bounties, &bounty_id);

        event::emit(WinnerSelected {
            bounty_id,
            winner: submission.submitter,
            submission_id,
            reward_amount: bounty.reward_amount,
        });
    }

    /// Claim bounty reward (winner only)
    public fun claim_bounty_reward(
        registry: &mut BountyRegistry,
        bounty_id: ID,
        ctx: &mut TxContext
    ) {
        let claimer = tx_context::sender(ctx);
        assert!(table::contains(&registry.bounties, bounty_id), E_BOUNTY_NOT_FOUND);
        
        let bounty = table::borrow_mut(&mut registry.bounties, bounty_id);
        assert!(bounty.status == STATUS_COMPLETED, E_INVALID_STATUS);
        assert!(option::is_some(&bounty.winner), E_NOT_WINNER);
        assert!(*option::borrow(&bounty.winner) == claimer, E_NOT_WINNER);
        assert!(balance::value(&bounty.reward_balance) > 0, E_ALREADY_CLAIMED);
        
        // Calculate platform fee
        let total_amount = balance::value(&bounty.reward_balance);
        let platform_fee = (total_amount * registry.platform_fee_rate) / 10000;
        let winner_amount = total_amount - platform_fee;
        
        // Transfer platform fee
        let platform_fee_balance = balance::split(&mut bounty.reward_balance, platform_fee);
        balance::join(&mut registry.platform_balance, platform_fee_balance);
        
        // Transfer remaining to winner
        let winner_balance = balance::withdraw_all(&mut bounty.reward_balance);
        let winner_coin = coin::from_balance(winner_balance, ctx);
        transfer::public_transfer(winner_coin, claimer);
        
        // Update registry stats
        registry.total_rewards_distributed = registry.total_rewards_distributed + winner_amount;

        event::emit(RewardClaimed {
            bounty_id,
            winner: claimer,
            amount: winner_amount,
        });
    }

    /// Cancel a bounty (creator only, if no winner selected)
    public fun cancel_bounty(
        registry: &mut BountyRegistry,
        bounty_id: ID,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        assert!(table::contains(&registry.bounties, bounty_id), E_BOUNTY_NOT_FOUND);
        
        let bounty = table::borrow_mut(&mut registry.bounties, bounty_id);
        assert!(bounty.creator == creator, E_NOT_AUTHORIZED);
        assert!(bounty.status != STATUS_COMPLETED, E_INVALID_STATUS);
        assert!(option::is_none(&bounty.winner), E_INVALID_STATUS);
        
        // Update status
        bounty.status = STATUS_CANCELLED;
        
        // Remove from active bounties
        if (vec_set::contains(&registry.active_bounties, &bounty_id)) {
            vec_set::remove(&mut registry.active_bounties, &bounty_id);
        };
        
        // Refund the reward
        let refund_amount = balance::value(&bounty.reward_balance);
        if (refund_amount > 0) {
            let refund_balance = balance::withdraw_all(&mut bounty.reward_balance);
            let refund_coin = coin::from_balance(refund_balance, ctx);
            transfer::public_transfer(refund_coin, creator);
        };

        event::emit(BountyCancelled {
            bounty_id,
            creator,
            refund_amount,
        });
    }

    /// Add metadata to bounty
    public fun add_bounty_metadata(
        registry: &mut BountyRegistry,
        bounty_id: ID,
        key: String,
        value: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&registry.bounties, bounty_id), E_BOUNTY_NOT_FOUND);
        
        let bounty = table::borrow_mut(&mut registry.bounties, bounty_id);
        assert!(bounty.creator == sender, E_NOT_AUTHORIZED);
        
        vec_map::insert(&mut bounty.metadata, key, value);
    }

    /// Add metadata to submission
    public fun add_submission_metadata(
        registry: &mut BountyRegistry,
        submission_id: ID,
        key: String,
        value: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&registry.submissions, submission_id), E_SUBMISSION_NOT_FOUND);
        
        let submission = table::borrow_mut(&mut registry.submissions, submission_id);
        assert!(submission.submitter == sender, E_NOT_AUTHORIZED);
        
        vec_map::insert(&mut submission.metadata, key, value);
    }

    // ======== View Functions ========

    /// Get bounty details
    public fun get_bounty(registry: &BountyRegistry, bounty_id: ID): &Bounty {
        table::borrow(&registry.bounties, bounty_id)
    }

    /// Get submission details
    public fun get_submission(registry: &BountyRegistry, submission_id: ID): &BountySubmission {
        table::borrow(&registry.submissions, submission_id)
    }

    /// Get active bounties
    public fun get_active_bounties(registry: &BountyRegistry): VecSet<ID> {
        registry.active_bounties
    }

    /// Get user's created bounties
    public fun get_user_bounties(registry: &BountyRegistry, user: address): VecSet<ID> {
        if (table::contains(&registry.user_bounties, user)) {
            *table::borrow(&registry.user_bounties, user)
        } else {
            vec_set::empty()
        }
    }

    /// Get bounties user submitted to
    public fun get_user_submissions(registry: &BountyRegistry, user: address): VecSet<ID> {
        if (table::contains(&registry.user_submissions, user)) {
            *table::borrow(&registry.user_submissions, user)
        } else {
            vec_set::empty()
        }
    }

    /// Get bounty submission count
    public fun get_submission_count(registry: &BountyRegistry, bounty_id: ID): u64 {
        let bounty = table::borrow(&registry.bounties, bounty_id);
        vec_set::size(&bounty.submissions)
    }

    /// Check if bounty is active
    public fun is_bounty_active(registry: &BountyRegistry, bounty_id: ID, clock: &Clock): bool {
        if (!table::contains(&registry.bounties, bounty_id)) {
            return false
        };
        let bounty = table::borrow(&registry.bounties, bounty_id);
        let current_time = clock::timestamp_ms(clock);
        
        (bounty.status == STATUS_OPEN || bounty.status == STATUS_IN_PROGRESS) && 
        current_time < bounty.deadline
    }

    /// Get platform statistics
    public fun get_platform_stats(registry: &BountyRegistry): (u64, u64, u64) {
        (
            registry.total_bounties,
            registry.total_rewards_distributed,
            balance::value(&registry.platform_balance)
        )
    }

    // ======== Test-only getter functions ========
    
    #[test_only]
    public fun get_total_bounties(registry: &BountyRegistry): u64 {
        registry.total_bounties
    }

    #[test_only] 
    public fun get_total_rewards_distributed(registry: &BountyRegistry): u64 {
        registry.total_rewards_distributed
    }

    #[test_only]
    public fun get_platform_balance(registry: &BountyRegistry): u64 {
        balance::value(&registry.platform_balance)
    }
}