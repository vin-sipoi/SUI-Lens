/// # SuilensCore - Event Management Platform
/// 
/// This module provides core functionality for the SUI-Lens event management platform,
/// including user profile management, event creation and registration, and platform
/// administration.
/// 
/// ## Features
/// - User profile creation and management
/// - Event creation with customizable parameters
/// - Event registration with payment processing
/// - Administrative functions for platform management
/// - Social link management for users
/// 
/// ## Usage
/// 1. Users must create a profile before creating events or registering
/// 2. Event creators can set ticket prices, capacity limits, and approval requirements
/// 3. Platform collects configurable fees on paid events
/// 4. Registration records are created for tracking attendance
/// 
/// ## Security
/// - Admin capabilities are required for platform management functions
/// - Input validation prevents invalid data entry
/// - Payment processing includes platform fee calculation
/// - Authorization checks prevent unauthorized actions
#[allow(duplicate_alias, lint(self_transfer))]
module suilens_contracts::suilens_core {
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

    // ======== Error Constants ========
    /// User is not authorized to perform this action
    const E_NOT_AUTHORIZED: u64 = 0;
    /// Event with the given ID does not exist
    const E_EVENT_NOT_FOUND: u64 = 1;
    /// User is already registered for this event
    const E_ALREADY_REGISTERED: u64 = 2;
    /// Event has reached maximum capacity
    const E_EVENT_FULL: u64 = 3;
    /// Payment amount is insufficient for the event ticket price
    const E_INSUFFICIENT_PAYMENT: u64 = 4;
    /// Registration for this event is closed
    const E_REGISTRATION_CLOSED: u64 = 5;
    /// Invalid time provided (start/end dates)
    const E_INVALID_TIME: u64 = 6;
    /// User profile not found
    const E_PROFILE_NOT_FOUND: u64 = 7;
    /// Registration is pending approval
    const E_PENDING_APPROVAL: u64 = 8;
    /// User is not registered for this event
    const E_NOT_REGISTERED: u64 = 9;
    /// Invalid parameter value provided
    const E_INVALID_PARAMETER: u64 = 10;

    // ======== Status Constants ========
    /// Registration is pending approval
    const REGISTRATION_STATUS_PENDING: u8 = 0;
    /// Registration is confirmed
    const REGISTRATION_STATUS_CONFIRMED: u8 = 1;
    /// Registration is cancelled
    const REGISTRATION_STATUS_CANCELLED: u8 = 2;
    /// User attended the event
    const REGISTRATION_STATUS_ATTENDED: u8 = 3;

    // ======== Platform Constants ========
    /// Default platform fee rate in basis points (2.5%)
    const DEFAULT_PLATFORM_FEE_RATE: u64 = 250;
    /// Maximum allowed platform fee rate in basis points (10%)
    const MAX_PLATFORM_FEE_RATE: u64 = 1000;
    /// Basis points denominator (10000 = 100%)
    const BASIS_POINTS_DENOMINATOR: u64 = 10000;

    // ======== Structs ========

    /// Administrative capability for platform management operations
    /// 
    /// This capability is required for:
    /// - Updating platform fee rates
    /// - Withdrawing platform fees
    /// - Other admin-only functions
    public struct AdminCap has key {
        id: UID,
    }

    /// Global registry containing all platform data
    /// 
    /// This shared object stores:
    /// - All events created on the platform
    /// - All user profiles
    /// - Platform statistics and configuration
    /// - Platform fee balance
    public struct GlobalRegistry has key {
        id: UID,
        /// Map of event IDs to Event objects
        events: Table<ID, Event>,
        /// Map of user addresses to UserProfile objects
        user_profiles: Table<address, UserProfile>,
        /// Total number of events created
        event_counter: u64,
        /// Total number of registered users
        total_users: u64,
        /// Platform fee rate in basis points (100 = 1%, 250 = 2.5%)
        platform_fee_rate: u64,
        /// Balance of collected platform fees
        platform_balance: Balance<SUI>,
    }

    /// User profile containing personal information and activity history
    /// 
    /// Each user on the platform has exactly one profile that tracks:
    /// - Personal information (username, bio, avatar)
    /// - Social media links
    /// - Event participation history
    /// - Community memberships
    /// - Reputation score
    public struct UserProfile has key, store {
        id: UID,
        /// User's wallet address (serves as unique identifier)
        wallet_address: address,
        /// Display name chosen by the user
        username: String,
        /// User's biography/description
        bio: String,
        /// URL to user's avatar image
        avatar_url: String,
        /// Map of social platform names to profile URLs
        social_links: VecMap<String, String>,
        /// Set of event IDs for events created by this user
        events_created: VecSet<ID>,
        /// Set of event IDs for events attended by this user
        events_attended: VecSet<ID>,
        /// Set of community IDs that this user has joined
        communities_joined: VecSet<ID>,
        /// Numerical reputation score (future feature)
        reputation_score: u64,
        /// Timestamp when profile was created
        created_at: u64,
        /// Timestamp when profile was last updated
        updated_at: u64,
    }

    /// Event structure
    public struct Event has key, store {
        id: UID,
        creator: address,
        title: String,
        description: String,
        image_url: String,
        start_date: u64,
        end_date: u64,
        location: String,
        category: String,
        capacity: Option<u64>,
        ticket_price: u64, // 0 for free events
        is_free: bool,
        requires_approval: bool,
        is_private: bool,
        is_active: bool,
        attendees: VecSet<address>,
        approved_attendees: VecSet<address>,
        pending_approvals: VecSet<address>,
        event_balance: Balance<SUI>,
        metadata: VecMap<String, String>,
        created_at: u64,
        updated_at: u64,
    }

    /// Event registration record
    public struct EventRegistration has key, store {
        id: UID,
        event_id: ID,
        attendee: address,
        payment_amount: u64,
        registration_date: u64,
        status: u8, // 0: pending, 1: confirmed, 2: cancelled, 3: attended
        approval_required: bool,
    }

    // ======== Events ========

    public struct EventCreated has copy, drop {
        event_id: ID,
        creator: address,
        title: String,
        start_date: u64,
        is_free: bool,
    }

    public struct UserRegistered has copy, drop {
        event_id: ID,
        attendee: address,
        payment_amount: u64,
        requires_approval: bool,
    }

    public struct RegistrationApproved has copy, drop {
        event_id: ID,
        attendee: address,
        approved_by: address,
    }

    public struct ProfileCreated has copy, drop {
        user_address: address,
        username: String,
    }

    public struct EventCancelled has copy, drop {
        event_id: ID,
        creator: address,
        refund_amount: u64,
    }

    // ======== Init Function ========

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        
        let global_registry = GlobalRegistry {
            id: object::new(ctx),
            events: table::new(ctx),
            user_profiles: table::new(ctx),
            event_counter: 0,
            total_users: 0,
            platform_fee_rate: DEFAULT_PLATFORM_FEE_RATE,
            platform_balance: balance::zero(),
        };

        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(global_registry);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    // ======== User Profile Functions ========

    /// Create a new user profile
    /// 
    /// # Arguments
    /// * `registry` - Global registry to store the profile
    /// * `username` - User's display name (must not be empty)
    /// * `bio` - User's biography
    /// * `avatar_url` - URL to user's avatar image
    /// * `clock` - Clock object for timestamping
    /// * `ctx` - Transaction context
    public fun create_profile(
        registry: &mut GlobalRegistry,
        username: String,
        bio: String,
        avatar_url: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let user_address = tx_context::sender(ctx);
        
        // Input validation
        validate_profile_inputs(&username, &bio);
        
        // Check if user already has a profile
        assert!(!table::contains(&registry.user_profiles, user_address), E_ALREADY_REGISTERED);

        let current_time = clock::timestamp_ms(clock);
        let profile = UserProfile {
            id: object::new(ctx),
            wallet_address: user_address,
            username,
            bio,
            avatar_url,
            social_links: vec_map::empty(),
            events_created: vec_set::empty(),
            events_attended: vec_set::empty(),
            communities_joined: vec_set::empty(),
            reputation_score: 0,
            created_at: current_time,
            updated_at: current_time,
        };

        event::emit(ProfileCreated {
            user_address,
            username: profile.username,
        });

        table::add(&mut registry.user_profiles, user_address, profile);
        registry.total_users = registry.total_users + 1;
    }

    /// Update user profile
    public fun update_profile(
        registry: &mut GlobalRegistry,
        username: String,
        bio: String,
        avatar_url: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let user_address = tx_context::sender(ctx);
        assert!(table::contains(&registry.user_profiles, user_address), E_PROFILE_NOT_FOUND);

        let profile = table::borrow_mut(&mut registry.user_profiles, user_address);
        profile.username = username;
        profile.bio = bio;
        profile.avatar_url = avatar_url;
        profile.updated_at = clock::timestamp_ms(clock);
    }

    /// Add social link to profile
    public fun add_social_link(
        registry: &mut GlobalRegistry,
        platform: String,
        url: String,
        ctx: &mut TxContext
    ) {
        let user_address = tx_context::sender(ctx);
        assert!(table::contains(&registry.user_profiles, user_address), E_PROFILE_NOT_FOUND);

        let profile = table::borrow_mut(&mut registry.user_profiles, user_address);
        vec_map::insert(&mut profile.social_links, platform, url);
    }

    // ======== Event Management Functions ========

    /// Create a new event
    public fun create_event(
        registry: &mut GlobalRegistry,
        title: String,
        description: String,
        image_url: String,
        start_date: u64,
        end_date: u64,
        location: String,
        category: String,
        capacity: Option<u64>,
        ticket_price: u64,
        requires_approval: bool,
        is_private: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        // Validate inputs
        validate_event_inputs(&title, start_date, end_date, current_time);
        
        // Ensure user has a profile
        assert!(table::contains(&registry.user_profiles, creator), E_PROFILE_NOT_FOUND);

        let event_id = object::new(ctx);
        let event_id_copy = object::uid_to_inner(&event_id);
        
        let event = Event {
            id: event_id,
            creator,
            title,
            description,
            image_url,
            start_date,
            end_date,
            location,
            category,
            capacity,
            ticket_price,
            is_free: ticket_price == 0,
            requires_approval,
            is_private,
            is_active: true,
            attendees: vec_set::empty(),
            approved_attendees: vec_set::empty(),
            pending_approvals: vec_set::empty(),
            event_balance: balance::zero(),
            metadata: vec_map::empty(),
            created_at: current_time,
            updated_at: current_time,
        };

        event::emit(EventCreated {
            event_id: event_id_copy,
            creator,
            title: event.title,
            start_date,
            is_free: event.is_free,
        });

        // Add event to creator's profile
        let profile = table::borrow_mut(&mut registry.user_profiles, creator);
        vec_set::insert(&mut profile.events_created, event_id_copy);

        // Add event to registry
        table::add(&mut registry.events, event_id_copy, event);
        registry.event_counter = registry.event_counter + 1;
    }

    /// Register for an event
    /// 
    /// # Arguments
    /// * `registry` - Global registry containing events and user profiles
    /// * `event_id` - ID of the event to register for
    /// * `payment` - SUI payment for the event ticket
    /// * `clock` - Clock object for timestamping
    /// * `ctx` - Transaction context
    public fun register_for_event(
        registry: &mut GlobalRegistry,
        event_id: ID,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let attendee = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        // Validate preconditions
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        assert!(table::contains(&registry.user_profiles, attendee), E_PROFILE_NOT_FOUND);

        let event = table::borrow_mut(&mut registry.events, event_id);
        
        // Validate registration eligibility
        validate_registration_eligibility(event, attendee, current_time);

        // Process payment
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= event.ticket_price, E_INSUFFICIENT_PAYMENT);

        // Calculate and process platform fee
        let platform_fee = (payment_amount * registry.platform_fee_rate) / BASIS_POINTS_DENOMINATOR;
        let mut payment_balance = coin::into_balance(payment);
        let platform_fee_balance = balance::split(&mut payment_balance, platform_fee);
        balance::join(&mut registry.platform_balance, platform_fee_balance);
        balance::join(&mut event.event_balance, payment_balance);

        // Handle registration based on approval requirement
        let registration_status = if (event.requires_approval) {
            vec_set::insert(&mut event.pending_approvals, attendee);
            REGISTRATION_STATUS_PENDING
        } else {
            vec_set::insert(&mut event.attendees, attendee);
            vec_set::insert(&mut event.approved_attendees, attendee);
            
            // Add to user's attended events
            let profile = table::borrow_mut(&mut registry.user_profiles, attendee);
            vec_set::insert(&mut profile.events_attended, event_id);
            REGISTRATION_STATUS_CONFIRMED
        };

        // Create registration record
        let registration = EventRegistration {
            id: object::new(ctx),
            event_id,
            attendee,
            payment_amount,
            registration_date: current_time,
            status: registration_status,
            approval_required: event.requires_approval,
        };

        transfer::public_transfer(registration, attendee);

        event::emit(UserRegistered {
            event_id,
            attendee,
            payment_amount,
            requires_approval: event.requires_approval,
        });
    }

    /// Approve a pending registration (event creator only)
    public fun approve_registration(
        registry: &mut GlobalRegistry,
        event_id: ID,
        attendee: address,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);

        let event = table::borrow_mut(&mut registry.events, event_id);
        assert!(event.creator == creator, E_NOT_AUTHORIZED);
        assert!(vec_set::contains(&event.pending_approvals, &attendee), E_PENDING_APPROVAL);

        // Move from pending to approved
        vec_set::remove(&mut event.pending_approvals, &attendee);
        vec_set::insert(&mut event.attendees, attendee);
        vec_set::insert(&mut event.approved_attendees, attendee);

        // Add to user's attended events
        let profile = table::borrow_mut(&mut registry.user_profiles, attendee);
        vec_set::insert(&mut profile.events_attended, event_id);

        event::emit(RegistrationApproved {
            event_id,
            attendee,
            approved_by: creator,
        });
    }

    /// Cancel event registration
    public fun cancel_registration(
        registry: &mut GlobalRegistry,
        event_id: ID,
        ctx: &mut TxContext
    ) {
        let attendee = tx_context::sender(ctx);
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);

        let event = table::borrow_mut(&mut registry.events, event_id);
        
        // Check if user is registered
        let was_registered = vec_set::contains(&event.attendees, &attendee);
        let was_pending = vec_set::contains(&event.pending_approvals, &attendee);
        assert!(was_registered || was_pending, E_NOT_REGISTERED);

        // Remove from appropriate sets
        if (was_registered) {
            vec_set::remove(&mut event.attendees, &attendee);
            vec_set::remove(&mut event.approved_attendees, &attendee);
        };
        if (was_pending) {
            vec_set::remove(&mut event.pending_approvals, &attendee);
        };

        // Process refund (simplified - would need more complex logic for partial refunds)
        let refund_amount = event.ticket_price;
        if (refund_amount > 0) {
            let refund_balance = balance::split(&mut event.event_balance, refund_amount);
            let refund_coin = coin::from_balance(refund_balance, ctx);
            transfer::public_transfer(refund_coin, attendee);
        };

        // Remove from user's attended events
        let profile = table::borrow_mut(&mut registry.user_profiles, attendee);
        vec_set::remove(&mut profile.events_attended, &event_id);
    }

    /// Update event details (creator only)
    public fun update_event(
        registry: &mut GlobalRegistry,
        event_id: ID,
        title: String,
        description: String,
        image_url: String,
        location: String,
        category: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);

        let event = table::borrow_mut(&mut registry.events, event_id);
        assert!(event.creator == creator, E_NOT_AUTHORIZED);

        event.title = title;
        event.description = description;
        event.image_url = image_url;
        event.location = location;
        event.category = category;
        event.updated_at = clock::timestamp_ms(clock);
    }

    /// Cancel an event (creator only)
    public fun cancel_event(
        registry: &mut GlobalRegistry,
        event_id: ID,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);

        let event = table::borrow_mut(&mut registry.events, event_id);
        assert!(event.creator == creator, E_NOT_AUTHORIZED);

        event.is_active = false;
        
        // Calculate total refunds
        let total_refund = balance::value(&event.event_balance);

        event::emit(EventCancelled {
            event_id,
            creator,
            refund_amount: total_refund,
        });
    }

    // ======== View Functions ========

    /// Get event details
    public fun get_event(registry: &GlobalRegistry, event_id: ID): &Event {
        table::borrow(&registry.events, event_id)
    }

    /// Get user profile
    public fun get_user_profile(registry: &GlobalRegistry, user_address: address): &UserProfile {
        table::borrow(&registry.user_profiles, user_address)
    }

    /// Get mutable user profile (internal use)
    public(package) fun get_user_profile_mut(registry: &mut GlobalRegistry, user_address: address): &mut UserProfile {
        table::borrow_mut(&mut registry.user_profiles, user_address)
    }

    /// Get platform statistics
    public fun get_platform_stats(registry: &GlobalRegistry): (u64, u64, u64) {
        (registry.event_counter, registry.total_users, balance::value(&registry.platform_balance))
    }

    /// Check if user is registered for event
    public fun is_registered(registry: &GlobalRegistry, event_id: ID, user: address): bool {
        if (!table::contains(&registry.events, event_id)) {
            return false
        };
        let event = table::borrow(&registry.events, event_id);
        vec_set::contains(&event.attendees, &user)
    }

    /// Get event attendee count
    public fun get_attendee_count(registry: &GlobalRegistry, event_id: ID): u64 {
        let event = table::borrow(&registry.events, event_id);
        vec_set::size(&event.attendees)
    }

    /// Get event creator
    public fun get_event_creator(registry: &GlobalRegistry, event_id: ID): address {
        let event = table::borrow(&registry.events, event_id);
        event.creator
    }

    /// Get event end date
    public fun get_event_end_date(registry: &GlobalRegistry, event_id: ID): u64 {
        let event = table::borrow(&registry.events, event_id);
        event.end_date
    }

    /// Get event title
    public fun get_event_title(registry: &GlobalRegistry, event_id: ID): String {
        let event = table::borrow(&registry.events, event_id);
        event.title
    }

    /// Get event start date
    public fun get_event_start_date(registry: &GlobalRegistry, event_id: ID): u64 {
        let event = table::borrow(&registry.events, event_id);
        event.start_date
    }

    /// Get event location
    public fun get_event_location(registry: &GlobalRegistry, event_id: ID): String {
        let event = table::borrow(&registry.events, event_id);
        event.location
    }

    /// Check if user is approved attendee
    public fun is_approved_attendee(registry: &GlobalRegistry, event_id: ID, user: address): bool {
        if (!table::contains(&registry.events, event_id)) {
            return false
        };
        let event = table::borrow(&registry.events, event_id);
        vec_set::contains(&event.approved_attendees, &user)
    }

    /// Get user wallet address
    public fun get_user_wallet_address(registry: &GlobalRegistry, user_address: address): address {
        let profile = table::borrow(&registry.user_profiles, user_address);
        profile.wallet_address
    }

    /// Check if user has profile
    public fun has_user_profile(registry: &GlobalRegistry, user_address: address): bool {
        table::contains(&registry.user_profiles, user_address)
    }

    /// Add community to user profile (package visibility)
    public(package) fun add_user_community(registry: &mut GlobalRegistry, user: address, community_id: ID) {
        let profile = table::borrow_mut(&mut registry.user_profiles, user);
        vec_set::insert(&mut profile.communities_joined, community_id);
    }

    /// Remove community from user profile (package visibility)
    public(package) fun remove_user_community(registry: &mut GlobalRegistry, user: address, community_id: ID) {
        let profile = table::borrow_mut(&mut registry.user_profiles, user);
        vec_set::remove(&mut profile.communities_joined, &community_id);
    }

    // ======== Admin Functions ========

    /// Withdraw platform fees (admin only)
    public fun withdraw_platform_fees(
        _: &AdminCap,
        registry: &mut GlobalRegistry,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let balance_amount = balance::value(&registry.platform_balance);
        assert!(amount <= balance_amount, E_INSUFFICIENT_PAYMENT);

        let withdrawal_balance = balance::split(&mut registry.platform_balance, amount);
        let withdrawal_coin = coin::from_balance(withdrawal_balance, ctx);
        transfer::public_transfer(withdrawal_coin, tx_context::sender(ctx));
    }

    /// Update platform fee rate (admin only)
    /// 
    /// # Arguments
    /// * `_` - Admin capability required
    /// * `registry` - Global registry to update
    /// * `new_rate` - New fee rate in basis points (max 10%)
    public fun update_platform_fee_rate(
        _: &AdminCap,
        registry: &mut GlobalRegistry,
        new_rate: u64,
    ) {
        // Validate fee rate is not excessive (max 10%)
        assert!(new_rate <= MAX_PLATFORM_FEE_RATE, E_INVALID_PARAMETER);
        registry.platform_fee_rate = new_rate;
    }

    // ======== Internal Helper Functions ========

    /// Validate profile input parameters
    /// 
    /// # Arguments
    /// * `username` - Username to validate (must not be empty)
    /// * `bio` - Bio to validate (no specific requirements currently)
    fun validate_profile_inputs(username: &String, _bio: &String) {
        use std::string;
        // Username must not be empty
        assert!(!string::is_empty(username), E_INVALID_PARAMETER);
    }

    /// Validate event input parameters
    /// 
    /// # Arguments
    /// * `title` - Event title (must not be empty)
    /// * `start_date` - Event start timestamp
    /// * `end_date` - Event end timestamp
    /// * `current_time` - Current timestamp
    fun validate_event_inputs(
        title: &String, 
        start_date: u64, 
        end_date: u64, 
        current_time: u64
    ) {
        use std::string;
        // Title must not be empty
        assert!(!string::is_empty(title), E_INVALID_PARAMETER);
        // Start date must be in the future
        assert!(start_date > current_time, E_INVALID_TIME);
        // End date must be after start date
        assert!(end_date > start_date, E_INVALID_TIME);
    }

    /// Validate registration eligibility
    /// 
    /// # Arguments
    /// * `event` - Event to register for
    /// * `attendee` - User attempting to register
    /// * `current_time` - Current timestamp
    fun validate_registration_eligibility(
        event: &Event,
        attendee: address,
        current_time: u64
    ) {
        // Check if registration is still open
        assert!(current_time < event.start_date, E_REGISTRATION_CLOSED);
        assert!(event.is_active, E_REGISTRATION_CLOSED);
        
        // Check if already registered
        assert!(!vec_set::contains(&event.attendees, &attendee), E_ALREADY_REGISTERED);
        assert!(!vec_set::contains(&event.pending_approvals, &attendee), E_ALREADY_REGISTERED);

        // Check capacity
        if (option::is_some(&event.capacity)) {
            let max_capacity = *option::borrow(&event.capacity);
            assert!(vec_set::size(&event.attendees) < max_capacity, E_EVENT_FULL);
        };
    }


    // ======== Test-only Functions ========

    #[test_only]
    /// Get events created by a user (for testing)
    public fun get_user_events_created(registry: &GlobalRegistry, user: address): vector<ID> {
        let profile = table::borrow(&registry.user_profiles, user);
        vec_set::into_keys(profile.events_created)
    }
}