# SUI-Lens Mainnet Deployment

## Latest Deployment
- **Date**: 2025-08-15
- **Network**: Sui Mainnet
- **Transaction**: `EW2A4vg2qxjgyfW9eZnFMK8BE1jXnUuTP1StcmsqJ9ro`
- **Deployer**: `0x9a5b0ad3a18964ab7c0dbf9ab4cdecfd6b3899423b47313ae6e78f4b801022a3`

## Contract Addresses

### Package
- **Package ID**: `0xfcfdddeed4ac04a41fcc73d25ef60921e162f5695dde54f8aa75a00cb00fd785`
- **Version**: 1

### Shared Objects (Registries)
- **GlobalRegistry**: `0x31ff956c2a7983edb450237628a363780c2651fff956f6c9aec9969b66f97c92`
- **POAPRegistry**: `0xc8dd38a9b655f355e5de22514ede961b219722eaada1c36d980fc085dcb571a3`
- **CommunityRegistry**: `0x9a5a7f1a40761a7e2487723251e043c11ce60432c6c19142717d6e20a3e4710b`
- **BountyRegistry**: `0xe48bfa0fb21c9200de91b7d7662a38db91dbe837bd5498178e47175621366a3e`

### Admin Objects
- **AdminCap**: `0x05ab8faf17b89c0175588aec85f55c021c93d61688779cbbb1701bf8b8195eb8`
- **UpgradeCap**: `0x49700e083a87399ce6ad63b08f4ec6769d3f81c8c861893f045cc6589d16367a`
- **Publisher**: `0xabcf7cf6f8df406f8c6cb6fcf5727f7841e39e1c8277d4ddf89f311835f850ac`
- **POAP Display**: `0x8ede707d5b0b407d386794fccfb43828607e0dfd954f4b74b233b24a2fb87699`

## Modules Deployed
1. `suilens_core` - Core event management functionality
2. `suilens_poap` - Proof of Attendance Protocol NFTs
3. `suilens_community` - Community management
4. `suilens_bounty` - Bounty and reward system

## Features
- ✅ 3-Image Event System (Banner, NFT, POAP)
- ✅ Event NFT Minting for registered attendees
- ✅ POAP claiming for checked-in attendees
- ✅ Fund withdrawal for event creators
- ✅ Attendance marking with QR codes
- ✅ Waitlist management
- ✅ Community creation and management
- ✅ Bounty system with rewards

## Integration
- **Frontend**: Next.js 15 with TypeScript
- **Authentication**: Enoki zkLogin with Google OAuth
- **Image Storage**: imgBB API
- **Network**: Sui Mainnet

## Gas Usage
- **Storage Cost**: 201,339,200 MIST
- **Computation Cost**: 1,000,000 MIST
- **Total**: ~0.202 SUI

## Notes
- All transactions are signed using Enoki zkLogin
- No traditional wallet required - users authenticate with Google
- Contracts support creators, attendees, and general users