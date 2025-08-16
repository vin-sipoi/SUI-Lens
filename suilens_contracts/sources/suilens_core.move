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
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use std::vector::{Self};
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
    use sui::bcs;
    use sui::hex;
    use sui::display;
    use sui::package;

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
    /// Event has not ended yet
    const E_EVENT_NOT_ENDED: u64 = 11;
    /// No funds available to withdraw
    const E_NO_FUNDS_TO_WITHDRAW: u64 = 12;
    /// Event has been cancelled
    const E_EVENT_CANCELLED: u64 = 13;
    /// Event has not started yet
    const E_EVENT_NOT_STARTED: u64 = 14;
    /// Event has already ended
    const E_EVENT_ENDED: u64 = 15;
    /// User is already checked in
    const E_ALREADY_CHECKED_IN: u64 = 16;
    /// Invalid ticket code
    const E_INVALID_TICKET: u64 = 17;
    /// Event has already started
    const E_EVENT_ALREADY_STARTED: u64 = 18;
    /// Cannot change price after registrations
    const E_CANNOT_CHANGE_PRICE: u64 = 19;
    /// Event has no capacity limit
    const E_NO_CAPACITY_LIMIT: u64 = 20;
    /// Event is not full
    const E_EVENT_NOT_FULL: u64 = 21;
    /// User is already on waitlist
    const E_ALREADY_WAITLISTED: u64 = 22;

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
        /// Map of event IDs to checked-in attendees
        attendance_records: Table<ID, VecSet<address>>,
        /// Map of event IDs to waitlisted users
        event_waitlists: Table<ID, VecSet<address>>,
        /// Map of registration IDs to EventRegistration objects
        registrations: Table<ID, EventRegistration>,
        /// Map of user addresses to their registration IDs
        user_registrations: Table<address, VecSet<ID>>,
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
        // Three different images for different purposes
        banner_url: String,      // Main event banner for marketing
        nft_image_url: String,   // Image for Event NFTs
        poap_image_url: String,  // Image for POAP badges
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
        ticket_code: String, // Unique ticket verification code
    }

    /// Event NFT that attendees can mint
    public struct EventNFT has key, store {
        id: UID,
        event_id: ID,
        event_name: String,
        event_image: String,
        event_date: u64,
        event_location: String,
        minted_by: address,
        minted_at: u64,
        edition_number: u64, // e.g., #1 of 100
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

    public struct EventFundsWithdrawn has copy, drop {
        event_id: ID,
        creator: address,
        amount: u64,
        platform_fee: u64,
    }

    public struct AttendanceMarked has copy, drop {
        event_id: ID,
        attendee: address,
        checked_in_by: address,
        check_in_time: u64,
    }

    public struct BatchAttendanceMarked has copy, drop {
        event_id: ID,
        count: u64,
        checked_in_by: address,
    }

    public struct JoinedWaitlist has copy, drop {
        event_id: ID,
        user: address,
        position: u64,
    }

    public struct WaitlistProcessed has copy, drop {
        event_id: ID,
        user: address,
    }

    public struct BatchRegistrationsApproved has copy, drop {
        event_id: ID,
        approver: address,
        count: u64,
    }

    public struct EventNFTMinted has copy, drop {
        nft_id: ID,
        event_id: ID,
        minter: address,
        edition: u64,
    }

    /// One-time witness for creating Display objects
    public struct SUILENS_CORE has drop {}

    // ======== Init Function ========

    fun init(otw: SUILENS_CORE, ctx: &mut TxContext) {
        // Create publisher for Display objects
        let publisher = package::claim(otw, ctx);

        // Create Display object for Event NFTs
        let mut event_nft_display = display::new_with_fields<EventNFT>(
            &publisher,
            vector[
                string::utf8(b"name"),
                string::utf8(b"description"),
                string::utf8(b"image_url"),
                string::utf8(b"project_url"),
                string::utf8(b"creator"),
                string::utf8(b"event_date"),
                string::utf8(b"event_location"),
                string::utf8(b"edition"),
            ],
            vector[
                string::utf8(b"{event_name} - Event NFT #{edition_number}"),
                string::utf8(b"Commemorative NFT for attending {event_name}. This NFT proves your participation in this event on the SuiLens platform."),
                string::utf8(b"{event_image}"),
                string::utf8(b"https://suilens.xyz/event/{event_id}"),
                string::utf8(b"SuiLens"),
                string::utf8(b"{event_date}"),
                string::utf8(b"{event_location}"),
                string::utf8(b"#{edition_number}"),
            ],
            ctx
        );

        // Update and freeze the Display object
        display::update_version(&mut event_nft_display);
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(event_nft_display, tx_context::sender(ctx));

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
            attendance_records: table::new(ctx),
            event_waitlists: table::new(ctx),
            registrations: table::new(ctx),
            user_registrations: table::new(ctx),
        };

        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(global_registry);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SUILENS_CORE {}, ctx);
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

    /// Create a new event with three images
    public fun create_event(
        registry: &mut GlobalRegistry,
        title: String,
        description: String,
        banner_url: String,
        nft_image_url: String,
        poap_image_url: String,
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
            banner_url,
            nft_image_url,
            poap_image_url,
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

        // Create registration record with ticket code
        let registration_id = object::new(ctx);
        let registration_id_copy = object::uid_to_inner(&registration_id);
        
        // Generate unique ticket code
        let ticket_code = generate_ticket_code(event_id, attendee, current_time);
        
        let registration = EventRegistration {
            id: registration_id,
            event_id,
            attendee,
            payment_amount,
            registration_date: current_time,
            status: registration_status,
            approval_required: event.requires_approval,
            ticket_code,
        };

        // Store registration in registry instead of transferring to user
        table::add(&mut registry.registrations, registration_id_copy, registration);
        
        // Track user's registrations
        if (!table::contains(&registry.user_registrations, attendee)) {
            table::add(&mut registry.user_registrations, attendee, vec_set::empty());
        };
        let user_regs = table::borrow_mut(&mut registry.user_registrations, attendee);
        vec_set::insert(user_regs, registration_id_copy);

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
        banner_url: String,
        nft_image_url: String,
        poap_image_url: String,
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
        event.banner_url = banner_url;
        event.nft_image_url = nft_image_url;
        event.poap_image_url = poap_image_url;
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

    /// Get event banner URL
    public fun get_event_banner_url(registry: &GlobalRegistry, event_id: ID): String {
        let event = table::borrow(&registry.events, event_id);
        event.banner_url
    }

    /// Get event NFT image URL
    public fun get_event_nft_image_url(registry: &GlobalRegistry, event_id: ID): String {
        let event = table::borrow(&registry.events, event_id);
        event.nft_image_url
    }

    /// Get event POAP image URL
    public fun get_event_poap_image_url(registry: &GlobalRegistry, event_id: ID): String {
        let event = table::borrow(&registry.events, event_id);
        event.poap_image_url
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

    /// Generate a unique ticket code for verification
    fun generate_ticket_code(
        event_id: ID,
        attendee: address,
        registration_date: u64
    ): String {
        // Create a unique identifier combining event, attendee, and timestamp
        let mut code = string::utf8(b"TKT-");
        
        // Add first 8 chars of event_id
        let event_id_bytes = object::id_to_bytes(&event_id);
        let event_hex = hex::encode(event_id_bytes);
        let event_hex_str = string::utf8(event_hex);
        if (string::length(&event_hex_str) >= 8) {
            string::append(&mut code, string::substring(&event_hex_str, 0, 8));
        } else {
            string::append(&mut code, event_hex_str);
        };
        string::append_utf8(&mut code, b"-");
        
        // Add first 8 chars of attendee address  
        let addr_bytes = bcs::to_bytes(&attendee);
        let addr_hex = hex::encode(addr_bytes);
        let addr_hex_str = string::utf8(addr_hex);
        if (string::length(&addr_hex_str) >= 8) {
            string::append(&mut code, string::substring(&addr_hex_str, 0, 8));
        } else {
            string::append(&mut code, addr_hex_str);
        };
        string::append_utf8(&mut code, b"-");
        
        // Add last 6 digits of timestamp
        let time_digits = registration_date % 1000000;
        let time_str = u64_to_string(time_digits);
        string::append(&mut code, time_str);
        
        code
    }

    /// Convert u64 to string
    fun u64_to_string(mut value: u64): String {
        if (value == 0) {
            return string::utf8(b"0")
        };
        let mut buffer = vector::empty<u8>();
        while (value != 0) {
            vector::push_back(&mut buffer, ((48 + value % 10) as u8));
            value = value / 10;
        };
        vector::reverse(&mut buffer);
        string::utf8(buffer)
    }

    // ======== New Functions for Missing Features ========

    /// Withdraw collected funds from an event (creator only)
    /// Can only withdraw after event has ended
    public fun withdraw_event_funds(
        registry: &mut GlobalRegistry,
        event_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event = table::borrow_mut(&mut registry.events, event_id);
        
        // Verify authorization and timing
        assert!(event.creator == creator, E_NOT_AUTHORIZED);
        assert!(current_time > event.end_date, E_EVENT_NOT_ENDED);
        assert!(event.is_active, E_EVENT_CANCELLED);
        
        // Calculate platform fee and creator share
        let total_amount = balance::value(&event.event_balance);
        assert!(total_amount > 0, E_NO_FUNDS_TO_WITHDRAW);
        
        let platform_fee = (total_amount * registry.platform_fee_rate) / BASIS_POINTS_DENOMINATOR;
        let creator_amount = total_amount - platform_fee;
        
        // Transfer platform fee
        let platform_fee_balance = balance::split(&mut event.event_balance, platform_fee);
        balance::join(&mut registry.platform_balance, platform_fee_balance);
        
        // Transfer remaining to creator
        let creator_balance = balance::withdraw_all(&mut event.event_balance);
        let creator_coin = coin::from_balance(creator_balance, ctx);
        transfer::public_transfer(creator_coin, creator);
        
        event::emit(EventFundsWithdrawn {
            event_id,
            creator,
            amount: creator_amount,
            platform_fee,
        });
    }

    /// Mark an attendee as checked in to the event (creator only)
    public fun mark_attendance(
        registry: &mut GlobalRegistry,
        event_id: ID,
        attendee: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let checker = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event = table::borrow(&registry.events, event_id);
        
        // Verify checker is authorized (creator)
        assert!(event.creator == checker, E_NOT_AUTHORIZED);
        
        // Verify event is happening (between start and end time)
        assert!(current_time >= event.start_date, E_EVENT_NOT_STARTED);
        assert!(current_time <= event.end_date, E_EVENT_ENDED);
        
        // Verify attendee is registered
        assert!(vec_set::contains(&event.approved_attendees, &attendee), E_NOT_REGISTERED);
        
        // Mark attendance in registry
        if (!table::contains(&registry.attendance_records, event_id)) {
            table::add(&mut registry.attendance_records, event_id, vec_set::empty());
        };
        let attendance_set = table::borrow_mut(&mut registry.attendance_records, event_id);
        
        assert!(!vec_set::contains(attendance_set, &attendee), E_ALREADY_CHECKED_IN);
        vec_set::insert(attendance_set, attendee);
        
        event::emit(AttendanceMarked {
            event_id,
            attendee,
            checked_in_by: checker,
            check_in_time: current_time,
        });
    }

    /// Batch mark attendance for multiple attendees
    public fun batch_mark_attendance(
        registry: &mut GlobalRegistry,
        event_id: ID,
        attendees: vector<address>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let checker = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event = table::borrow(&registry.events, event_id);
        
        assert!(event.creator == checker, E_NOT_AUTHORIZED);
        assert!(current_time >= event.start_date && current_time <= event.end_date, E_INVALID_TIME);
        
        if (!table::contains(&registry.attendance_records, event_id)) {
            table::add(&mut registry.attendance_records, event_id, vec_set::empty());
        };
        let attendance_set = table::borrow_mut(&mut registry.attendance_records, event_id);
        
        let mut i = 0;
        let len = vector::length(&attendees);
        while (i < len) {
            let attendee = *vector::borrow(&attendees, i);
            if (vec_set::contains(&event.approved_attendees, &attendee) && 
                !vec_set::contains(attendance_set, &attendee)) {
                vec_set::insert(attendance_set, attendee);
            };
            i = i + 1;
        };
        
        event::emit(BatchAttendanceMarked {
            event_id,
            count: len,
            checked_in_by: checker,
        });
    }

    /// Verify a ticket code and check in if valid
    public fun verify_and_checkin(
        registry: &mut GlobalRegistry,
        event_id: ID,
        ticket_code: String,
        attendee: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify ticket code matches expected format
        assert!(string::length(&ticket_code) > 0, E_INVALID_TICKET);
        
        // Proceed with normal attendance marking
        mark_attendance(registry, event_id, attendee, clock, ctx);
    }

    /// Self check-in function for attendees using QR code
    /// Allows registered attendees to check themselves in during the event
    public fun self_checkin(
        registry: &mut GlobalRegistry,
        event_id: ID,
        verification_code: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let attendee = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        // Verify verification code is not empty
        assert!(string::length(&verification_code) > 0, E_INVALID_TICKET);
        
        // Get the event
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event = table::borrow(&registry.events, event_id);
        
        // Verify event timing (must be during the event)
        assert!(current_time >= event.start_date, E_EVENT_NOT_STARTED);
        assert!(current_time <= event.end_date, E_EVENT_ENDED);
        
        // Verify attendee is registered for the event
        assert!(
            vec_set::contains(&event.attendees, &attendee) || 
            vec_set::contains(&event.approved_attendees, &attendee),
            E_NOT_REGISTERED
        );
        
        // Initialize attendance records if needed
        if (!table::contains(&registry.attendance_records, event_id)) {
            table::add(&mut registry.attendance_records, event_id, vec_set::empty());
        };
        
        let attendance_set = table::borrow_mut(&mut registry.attendance_records, event_id);
        
        // Check if already checked in
        assert!(!vec_set::contains(attendance_set, &attendee), E_ALREADY_CHECKED_IN);
        
        // Mark as attended
        vec_set::insert(attendance_set, attendee);
        
        // Emit attendance event
        event::emit(AttendanceMarked {
            event_id,
            attendee,
            checked_in_by: attendee, // Self check-in
            check_in_time: current_time,
        });
    }

    /// Update critical event parameters (creator only, before event starts)
    public fun update_event_critical(
        registry: &mut GlobalRegistry,
        event_id: ID,
        start_date: Option<u64>,
        end_date: Option<u64>,
        ticket_price: Option<u64>,
        capacity: Option<Option<u64>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event = table::borrow_mut(&mut registry.events, event_id);
        
        assert!(event.creator == creator, E_NOT_AUTHORIZED);
        // Can only update before event starts
        assert!(current_time < event.start_date, E_EVENT_ALREADY_STARTED);
        
        // Update start date if provided
        if (option::is_some(&start_date)) {
            let new_start = *option::borrow(&start_date);
            assert!(new_start > current_time, E_INVALID_TIME);
            event.start_date = new_start;
        };
        
        // Update end date if provided
        if (option::is_some(&end_date)) {
            let new_end = *option::borrow(&end_date);
            assert!(new_end > event.start_date, E_INVALID_TIME);
            event.end_date = new_end;
        };
        
        // Update ticket price if provided (only if no registrations yet)
        if (option::is_some(&ticket_price)) {
            assert!(vec_set::is_empty(&event.attendees), E_CANNOT_CHANGE_PRICE);
            let new_price = *option::borrow(&ticket_price);
            event.ticket_price = new_price;
            event.is_free = new_price == 0;
        };
        
        // Update capacity if provided
        if (option::is_some(&capacity)) {
            event.capacity = *option::borrow(&capacity);
        };
        
        event.updated_at = current_time;
    }

    /// Get detailed event statistics
    public fun get_event_stats(
        registry: &GlobalRegistry,
        event_id: ID
    ): (u64, u64, u64, u64, u64, bool) {
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event = table::borrow(&registry.events, event_id);
        
        let total_registered = vec_set::size(&event.attendees);
        let pending_approvals = vec_set::size(&event.pending_approvals);
        let total_revenue = balance::value(&event.event_balance);
        
        // Get attendance count
        let attended = if (table::contains(&registry.attendance_records, event_id)) {
            let attendance_set = table::borrow(&registry.attendance_records, event_id);
            vec_set::size(attendance_set)
        } else {
            0
        };
        
        // Get waitlist count
        let waitlisted = if (table::contains(&registry.event_waitlists, event_id)) {
            let waitlist = table::borrow(&registry.event_waitlists, event_id);
            vec_set::size(waitlist)
        } else {
            0
        };
        
        (
            total_registered,
            pending_approvals,
            attended,
            waitlisted,
            total_revenue,
            event.is_active
        )
    }

    /// Join event waitlist when event is full
    public fun join_waitlist(
        registry: &mut GlobalRegistry,
        event_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        let _current_time = clock::timestamp_ms(clock);
        
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        assert!(table::contains(&registry.user_profiles, user), E_PROFILE_NOT_FOUND);
        
        let event = table::borrow(&registry.events, event_id);
        
        // Verify event is full
        assert!(option::is_some(&event.capacity), E_NO_CAPACITY_LIMIT);
        let max_capacity = *option::borrow(&event.capacity);
        assert!(vec_set::size(&event.attendees) >= max_capacity, E_EVENT_NOT_FULL);
        
        // Verify not already registered or waitlisted
        assert!(!vec_set::contains(&event.attendees, &user), E_ALREADY_REGISTERED);
        assert!(!vec_set::contains(&event.pending_approvals, &user), E_ALREADY_REGISTERED);
        
        // Add to waitlist
        if (!table::contains(&registry.event_waitlists, event_id)) {
            table::add(&mut registry.event_waitlists, event_id, vec_set::empty());
        };
        let waitlist = table::borrow_mut(&mut registry.event_waitlists, event_id);
        assert!(!vec_set::contains(waitlist, &user), E_ALREADY_WAITLISTED);
        
        vec_set::insert(waitlist, user);
        
        event::emit(JoinedWaitlist {
            event_id,
            user,
            position: vec_set::size(waitlist),
        });
    }

    /// Batch approve multiple registration requests
    public fun batch_approve_registrations(
        registry: &mut GlobalRegistry,
        event_id: ID,
        attendees: vector<address>,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event = table::borrow_mut(&mut registry.events, event_id);
        assert!(event.creator == creator, E_NOT_AUTHORIZED);
        
        let mut i = 0;
        let len = vector::length(&attendees);
        let mut approved_count = 0;
        
        while (i < len) {
            let attendee = *vector::borrow(&attendees, i);
            
            // Check if in pending approvals
            if (vec_set::contains(&event.pending_approvals, &attendee)) {
                // Move from pending to approved
                vec_set::remove(&mut event.pending_approvals, &attendee);
                vec_set::insert(&mut event.attendees, attendee);
                vec_set::insert(&mut event.approved_attendees, attendee);
                
                // Update user profile
                let profile = table::borrow_mut(&mut registry.user_profiles, attendee);
                vec_set::insert(&mut profile.events_attended, event_id);
                
                approved_count = approved_count + 1;
            };
            
            i = i + 1;
        };
        
        event::emit(BatchRegistrationsApproved {
            event_id,
            approver: creator,
            count: approved_count,
        });
    }

    /// Check if user has attended an event (checked in)
    public fun has_attended_event(registry: &GlobalRegistry, event_id: ID, user: address): bool {
        if (!table::contains(&registry.attendance_records, event_id)) {
            return false
        };
        let attendance_set = table::borrow(&registry.attendance_records, event_id);
        vec_set::contains(attendance_set, &user)
    }

    /// Get registration for a user for a specific event
    public fun get_user_registration(
        registry: &GlobalRegistry,
        user: address,
        event_id: ID
    ): Option<ID> {
        if (!table::contains(&registry.user_registrations, user)) {
            return option::none()
        };
        
        let user_regs = table::borrow(&registry.user_registrations, user);
        let reg_ids = vec_set::into_keys(*user_regs);
        
        let mut i = 0;
        let len = vector::length(&reg_ids);
        while (i < len) {
            let reg_id = *vector::borrow(&reg_ids, i);
            let registration = table::borrow(&registry.registrations, reg_id);
            if (registration.event_id == event_id) {
                return option::some(reg_id)
            };
            i = i + 1;
        };
        
        option::none()
    }

    /// Mint an Event NFT for a registered attendee
    public fun mint_event_nft(
        registry: &mut GlobalRegistry,
        event_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let minter = tx_context::sender(ctx);
        
        // Verify user is registered for the event
        assert!(is_approved_attendee(registry, event_id, minter), E_NOT_REGISTERED);
        
        // Get edition number first (this modifies metadata)
        let edition = get_next_nft_edition(registry, event_id);
        
        // Now get event details for the NFT
        let event = table::borrow(&registry.events, event_id);
        let event_name = event.title;
        let event_image = event.nft_image_url;
        let event_date = event.start_date;
        let event_location = event.location;
        
        // Create the NFT
        let nft_id = object::new(ctx);
        let nft_id_copy = object::uid_to_inner(&nft_id);
        
        let nft = EventNFT {
            id: nft_id,
            event_id,
            event_name,
            event_image, // Use the NFT-specific image
            event_date,
            event_location,
            minted_by: minter,
            minted_at: clock::timestamp_ms(clock),
            edition_number: edition,
        };
        
        // Emit event
        event::emit(EventNFTMinted {
            nft_id: nft_id_copy,
            event_id,
            minter,
            edition,
        });
        
        // Transfer NFT to minter
        transfer::public_transfer(nft, minter);
    }

    /// Helper function to get next NFT edition number
    fun get_next_nft_edition(registry: &mut GlobalRegistry, event_id: ID): u64 {
        let event = table::borrow_mut(&mut registry.events, event_id);
        
        // Use metadata to track NFT count
        let edition_key = string::utf8(b"nft_edition_count");
        let current_edition = if (vec_map::contains(&event.metadata, &edition_key)) {
            let edition_str = *vec_map::get(&event.metadata, &edition_key);
            // Simple conversion - in production would use proper parsing
            let mut edition: u64 = 0;
            let bytes = string::as_bytes(&edition_str);
            let mut i = 0;
            let len = vector::length(bytes);
            while (i < len) {
                let byte = *vector::borrow(bytes, i);
                if (byte >= 48 && byte <= 57) { // ASCII digits 0-9
                    edition = edition * 10 + ((byte - 48) as u64);
                };
                i = i + 1;
            };
            edition
        } else {
            0
        };
        
        let next_edition = current_edition + 1;
        
        // Update the count in metadata
        let next_edition_str = u64_to_string(next_edition);
        if (vec_map::contains(&event.metadata, &edition_key)) {
            vec_map::remove(&mut event.metadata, &edition_key);
        };
        vec_map::insert(&mut event.metadata, edition_key, next_edition_str);
        
        next_edition
    }

    // ======== Test-only Functions ========

    #[test_only]
    /// Get events created by a user (for testing)
    public fun get_user_events_created(registry: &GlobalRegistry, user: address): vector<ID> {
        let profile = table::borrow(&registry.user_profiles, user);
        vec_set::into_keys(profile.events_created)
    }
}