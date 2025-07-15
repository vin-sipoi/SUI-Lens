# SUI-Lens Smart Contract Integration Guide

## Overview

This guide explains how the SUI-Lens platform integrates with the deployed smart contracts on Sui Testnet.

## Deployed Contract Information

### Network: Sui Testnet

### Contract Details
- **Package ID**: `0x08b7f3a2025c8d8fdac1e26574a8f7b6fc8716d816de9cbb344de9a4fc4e14d9`
- **Deployment Transaction**: `HPeMvh5TVXRwc5NbpBcAWXySLwJNrySVky4rV2quif6e`
- **Deployer**: `0x4822bfc9c86d1a77daf48b0bdf8f012ae9b7f8f01b4195dc0f3fd4fb838525bd`

### Shared Objects
- **GlobalRegistry**: `0x7b00de0ccf7ac483986fd3deaedbdf6677277a71708a0ec3c3ace2943240459c`
- **POAPRegistry**: `0x06ca393e1c3ee5ac79426738dc91d81a1e2749d127a6ac4a8a22339a756c385e`
- **CommunityRegistry**: `0xe63b907800bccb44475b3aab5337fcb304fa871a1c53377e350194f660372630`
- **BountyRegistry**: `0xf0b70aea0a8ecfadaae610012499d37af8ca3af3ee985c9d2ff06630458f5f0c`

### Admin Objects
- **AdminCap**: `0xaed6291cfcc31e47c5298195bd362b4f6535db537c49a2b45419a405e2460ec3`
- **UpgradeCap**: `0x190759effc042f10a41ddb55d7a65cbe81b361430ef8acdc0d097e6142431f8f`
- **Publisher**: `0x9acb1d42fa1cd091acc8347e7468d63a971f835ac38f2718aca5eb0ce2d4feb3`
- **POAPDisplay**: `0x955a419295370f50a7a188583d9fdaf693c4e1c71567b3c3d7b298999a3180f9`

## Frontend Integration

### 1. Configuration Files

#### `/lib/sui-contracts.ts`
Contains all contract addresses, module names, and function names. This is the central configuration file for smart contract interaction.

#### `/hooks/useSuiContracts.ts`
Provides React hooks for interacting with the smart contracts:
- `createProfile` - Create user profile
- `createEvent` - Create new event
- `registerForEvent` - Register for an event
- `createPoapCollection` - Create POAP for event
- `claimPoap` - Claim event POAP
- Query functions for fetching data

### 2. Usage Example

```typescript
import { useSuiContracts } from '@/hooks/useSuiContracts';

function CreateEventPage() {
  const { createEvent, isLoading } = useSuiContracts();
  
  const handleSubmit = async () => {
    await createEvent({
      title: "Sui Developer Meetup",
      description: "Monthly developer gathering",
      imageUrl: "https://...",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-02-01"),
      location: "Virtual",
      category: "technology",
      capacity: 100,
      ticketPrice: 0, // Free event
      requiresApproval: false,
      isPrivate: false,
    });
  };
}
```

### 3. Contract Functions

#### User Profile Management
- `create_profile` - Creates a new user profile
- `update_profile` - Updates existing profile
- `add_social_link` - Adds social media links

#### Event Management
- `create_event` - Creates a new event
- `register_for_event` - Register for an event (with payment)
- `approve_registration` - Approve pending registrations
- `cancel_registration` - Cancel event registration
- `update_event` - Update event details
- `cancel_event` - Cancel an entire event

#### POAP System
- `create_poap_collection` - Create POAP collection for event
- `claim_poap` - Claim POAP after event ends
- `update_collection` - Update POAP details
- `deactivate_collection` - Deactivate POAP collection

#### Community Management
- `create_community` - Create new community
- `join_community` - Join a community
- `approve_join_request` - Approve join requests
- `leave_community` - Leave a community
- `add_moderator` - Add community moderator
- `post_announcement` - Post community announcement

#### Bounty System
- `create_bounty` - Create new bounty
- `submit_bounty_work` - Submit work for bounty
- `select_winner` - Select bounty winner
- `claim_bounty_reward` - Claim bounty rewards
- `cancel_bounty` - Cancel active bounty

### 4. Transaction Building

The integration uses the Sui TypeScript SDK to build transactions:

```typescript
const tx = new Transaction();

// Example: Creating an event
tx.moveCall({
  target: `${PACKAGE_ID}::suilens_core::create_event`,
  arguments: [
    tx.object(globalRegistry),
    tx.pure.string(title),
    tx.pure.string(description),
    tx.pure.string(imageUrl),
    tx.pure.u64(startTimestamp),
    tx.pure.u64(endTimestamp),
    tx.pure.string(location),
    tx.pure.string(category),
    tx.pure.option('u64', capacity),
    tx.pure.u64(ticketPrice),
    tx.pure.bool(requiresApproval),
    tx.pure.bool(isPrivate),
    tx.object('0x6'), // Clock object
  ],
});
```

### 5. Payment Handling

For paid events, the system handles SUI token payments:

```typescript
// Split coins for payment
const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentAmount)]);

// Register with payment
tx.moveCall({
  target: `${PACKAGE_ID}::suilens_core::register_for_event`,
  arguments: [
    tx.object(globalRegistry),
    tx.pure.id(eventId),
    coin, // Payment coin
    tx.object('0x6'), // Clock
  ],
});
```

### 6. Platform Fee Structure

- **Event Registration**: 2.5% platform fee
- **Bounty Rewards**: 2.5% platform fee
- Fees accumulate in platform balance
- Admin can withdraw accumulated fees

### 7. Error Handling

Common error codes:
- `E_NOT_AUTHORIZED` (0) - User not authorized
- `E_EVENT_NOT_FOUND` (1) - Event doesn't exist
- `E_ALREADY_REGISTERED` (2) - Already registered
- `E_EVENT_FULL` (3) - Event at capacity
- `E_INSUFFICIENT_PAYMENT` (4) - Payment too low
- `E_REGISTRATION_CLOSED` (5) - Registration closed
- `E_PROFILE_NOT_FOUND` (7) - User profile not found

### 8. Testing on Testnet

1. Connect to Sui Testnet in your wallet
2. Get test SUI from faucet: https://faucet.testnet.sui.io/
3. Create a profile first before creating events
4. Test event creation with both free and paid options
5. Test POAP creation and claiming after events

### 9. Next Steps

1. **Image Storage**: Implement IPFS integration for event images
2. **Event Discovery**: Add indexing for efficient event queries
3. **Notifications**: Implement event reminders and updates
4. **Analytics**: Add event analytics and attendance tracking
5. **Mainnet Migration**: Prepare for mainnet deployment

### 10. Security Considerations

- All payment handling is done on-chain
- Platform fees are automatically deducted
- Event creators control registration approvals
- POAP claiming requires event attendance verification
- Admin functions are protected by capability objects

## Development Commands

### Build Contracts
```bash
cd suilens_contracts
sui move build
```

### Deploy Contracts
```bash
sui client publish --gas-budget 500000000
```

### Test Integration
```bash
npm run dev
# Visit http://localhost:3000
```

## Support

For questions about the smart contract integration:
1. Check the contract source code in `/suilens_contracts/sources/`
2. Review transaction errors in the browser console
3. Test with small amounts on testnet first
4. Join the Sui Discord for developer support