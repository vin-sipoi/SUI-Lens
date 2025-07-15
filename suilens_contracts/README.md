# SUI-Lens Smart Contracts

A comprehensive blockchain event management platform built on the Sui Network, featuring event creation, community management, POAPs (Proof of Attendance Protocol NFTs), and bounty systems.

## Overview

SUI-Lens provides a decentralized infrastructure for managing events, communities, and bounties on the Sui blockchain. The platform consists of four main smart contract modules:

1. **SuilensCore** - Main contract for event management and user profiles
2. **SuilensPOAP** - NFT-based proof of attendance system
3. **SuilensCommunity** - Community and regional group management
4. **SuilensBounty** - Bounty creation and reward distribution system

## Features

### Event Management (SuilensCore)
- Create and manage blockchain events with comprehensive metadata
- User profile system with wallet integration
- Event registration with payment processing
- Approval-based registration for private events
- Platform fee collection (2.5% default)
- Event cancellation with automatic refunds
- Real-time attendee tracking

### POAP System (SuilensPOAP)
- Create POAP collections for events
- Automatic NFT minting for event attendees
- Customizable NFT metadata and images
- Claim verification based on attendance
- Collection statistics and tracking
- Display standard compliance for NFT marketplaces

### Community Management (SuilensCommunity)
- Create regional and category-based communities
- Member management with join requests
- Moderator roles and permissions
- Community announcements
- Event association with communities
- Private/public community options

### Bounty System (SuilensBounty)
- Create bounties with SUI token rewards
- Submission management and tracking
- Winner selection by bounty creator
- Automatic reward distribution
- Platform fee on bounty rewards
- Deadline enforcement

## Contract Architecture

```
suilens_contracts/
├── sources/
│   ├── suilens_core.move      # Core event and user management
│   ├── suilens_poap.move      # POAP NFT system
│   ├── suilens_community.move # Community management
│   └── suilens_bounty.move    # Bounty and rewards system
├── Move.toml                   # Package configuration
└── README.md                   # This file
```

## Key Data Structures

### Event
```move
struct Event {
    id: UID,
    creator: address,
    title: String,
    description: String,
    start_date: u64,
    end_date: u64,
    location: String,
    category: String,
    capacity: Option<u64>,
    ticket_price: u64,
    is_free: bool,
    requires_approval: bool,
    is_private: bool,
    attendees: VecSet<address>,
    // ... more fields
}
```

### POAP NFT
```move
struct POAP {
    id: UID,
    collection_id: ID,
    event_id: ID,
    name: String,
    description: String,
    image_url: Url,
    claimed_by: address,
    claimed_at: u64,
    attributes: VecMap<String, String>,
}
```

### Community
```move
struct Community {
    id: UID,
    name: String,
    description: String,
    region: String,
    category: String,
    admin: address,
    moderators: VecSet<address>,
    members: VecSet<address>,
    // ... more fields
}
```

### Bounty
```move
struct Bounty {
    id: UID,
    creator: address,
    title: String,
    description: String,
    reward_balance: Balance<SUI>,
    reward_amount: u64,
    deadline: u64,
    status: u8,
    submissions: VecSet<ID>,
    winner: Option<address>,
    // ... more fields
}
```

## Deployment

### Prerequisites
- Sui CLI installed
- Sui wallet with SUI tokens for gas fees

### Build the contracts
```bash
sui move build
```

### Deploy to testnet
```bash
sui client publish --gas-budget 100000000
```

### Deploy to mainnet
```bash
sui client publish --gas-budget 100000000 --network mainnet
```

## Usage Examples

### Create a User Profile
```move
suilens_core::create_profile(
    &mut global_registry,
    b"John Doe",
    b"Blockchain enthusiast",
    b"https://avatar.url",
    &clock,
    ctx
);
```

### Create an Event
```move
suilens_core::create_event(
    &mut global_registry,
    b"Sui Developer Meetup",
    b"Monthly meetup for Sui developers",
    b"https://event-image.url",
    start_timestamp,
    end_timestamp,
    b"San Francisco, CA",
    b"Development",
    option::some(50), // capacity
    1000000, // ticket price in MIST (0.001 SUI)
    false, // requires approval
    false, // is private
    &clock,
    ctx
);
```

### Register for an Event
```move
suilens_core::register_for_event(
    &mut global_registry,
    event_id,
    payment_coin,
    &clock,
    ctx
);
```

### Create a POAP Collection
```move
suilens_poap::create_poap_collection(
    &mut poap_registry,
    &global_registry,
    event_id,
    b"Sui Meetup POAP",
    b"Proof of attendance for Sui Developer Meetup",
    b"https://poap-image.url",
    option::some(100), // max supply
    &clock,
    ctx
);
```

### Claim a POAP
```move
suilens_poap::claim_poap(
    &mut poap_registry,
    &global_registry,
    event_id,
    &clock,
    ctx
);
```

### Create a Community
```move
suilens_community::create_community(
    &mut community_registry,
    &global_registry,
    b"Sui Kenya",
    b"Sui developers in Kenya",
    b"https://community-image.url",
    b"Kenya",
    b"regional",
    false, // is private
    &clock,
    ctx
);
```

### Create a Bounty
```move
suilens_bounty::create_bounty(
    &mut bounty_registry,
    &global_registry,
    b"Build a Sui DeFi Dashboard",
    b"Create a dashboard for tracking DeFi protocols on Sui",
    b"Must include TVL tracking, yield farming opportunities",
    b"Development",
    deadline_timestamp,
    reward_coin, // 10 SUI
    &clock,
    ctx
);
```

## Security Considerations

1. **Access Control**: All modification functions include proper authorization checks
2. **Payment Validation**: Ensures sufficient payment for events and bounties
3. **Time Validation**: Enforces deadlines and event timing constraints
4. **Refund Mechanisms**: Automatic refunds for cancelled events
5. **Platform Fees**: Transparent fee collection with admin-only withdrawal

## Platform Fees

- Event Registration: 2.5% of ticket price
- Bounty Rewards: 2.5% of reward amount
- Fees are collected in the platform balance
- Only admin can withdraw collected fees

## Error Codes

### Common Error Codes
- `E_NOT_AUTHORIZED (0)`: Unauthorized access attempt
- `E_EVENT_NOT_FOUND (1)`: Event does not exist
- `E_ALREADY_REGISTERED (2)`: User already registered
- `E_INSUFFICIENT_PAYMENT (4)`: Payment amount too low
- `E_PROFILE_NOT_FOUND (7)`: User profile not found

## Testing

Run the test suite:
```bash
sui move test
```

## Frontend Integration

The contracts are designed to integrate seamlessly with the Next.js frontend. Key integration points:

1. **Wallet Connection**: Use `@mysten/dapp-kit` for Sui wallet integration
2. **Contract Calls**: Import contract ABIs and call functions through the Sui SDK
3. **Event Listening**: Subscribe to on-chain events for real-time updates
4. **Data Queries**: Use view functions to fetch contract state

## Future Enhancements

1. **Multi-signature Admin**: Support for multiple platform administrators
2. **Escrow System**: Hold payments until event completion
3. **Reputation System**: On-chain reputation tracking for users
4. **Token Gating**: Support for token-gated events
5. **Cross-chain Integration**: Bridge to other blockchains

## License

MIT License - see LICENSE file for details

## Support

For questions or support, please open an issue in the GitHub repository or contact the SUI-Lens team.