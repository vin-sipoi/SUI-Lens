# SUI-Lens - Event Management Platform for Sui Blockchain

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Deployed on Sui](https://img.shields.io/badge/Deployed%20on-Sui%20Testnet-blue?style=for-the-badge)](https://sui.io)

## Overview

SUI-Lens is a comprehensive event management platform built on the Sui blockchain, enabling users to create, discover, and participate in events with blockchain-powered features like POAPs, community management, and bounty systems.

## 🚀 Features

- **Event Management**: Create and manage events with customizable settings
- **Blockchain Registration**: On-chain event registration with SUI payments
- **POAP NFTs**: Proof of Attendance Protocol NFTs for event attendees
- **Community System**: Regional and category-based community management
- **Bounty Platform**: Create and manage bounties with SUI rewards
- **User Profiles**: On-chain user profiles with social links
- **QR Code Check-in**: Easy event check-in with QR codes
- **Platform Fees**: 2.5% platform fee on transactions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Blockchain**: Sui Network, Move Language
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: Zustand, React Context
- **Wallet Integration**: @mysten/dapp-kit
- **Database**: Libsql (for off-chain data)

## 📦 Smart Contract Deployment

### Testnet Deployment (Current)

- **Network**: Sui Testnet
- **Package ID**: `0x08b7f3a2025c8d8fdac1e26574a8f7b6fc8716d816de9cbb344de9a4fc4e14d9`
- **Transaction**: `HPeMvh5TVXRwc5NbpBcAWXySLwJNrySVky4rV2quif6e`

### Shared Objects

```
GlobalRegistry: 0x7b00de0ccf7ac483986fd3deaedbdf6677277a71708a0ec3c3ace2943240459c
POAPRegistry: 0x06ca393e1c3ee5ac79426738dc91d81a1e2749d127a6ac4a8a22339a756c385e
CommunityRegistry: 0xe63b907800bccb44475b3aab5337fcb304fa871a1c53377e350194f660372630
BountyRegistry: 0xf0b70aea0a8ecfadaae610012499d37af8ca3af3ee985c9d2ff06630458f5f0c
```

## 🏃 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Sui Wallet (Sui Wallet, Suiet, or Martian)
- Test SUI tokens from [faucet](https://faucet.testnet.sui.io/)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/sui-lens.git
cd sui-lens
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Building Smart Contracts

```bash
cd suilens_contracts
sui move build
sui client publish --gas-budget 500000000
```

## 📚 Documentation

- [Smart Contract Integration Guide](./docs/SMART_CONTRACT_INTEGRATION.md)
- [Contract Source Code](./suilens_contracts/sources/)
- [Frontend Components](./app/)

## 🧪 Testing

### Frontend Testing
```bash
npm run test
npm run lint
```

### Contract Testing
```bash
cd suilens_contracts
sui move test
```

### Integration Testing
```bash
npx ts-node scripts/test-contracts.ts
```

## 🗂️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── create/            # Event creation page
│   ├── discover/          # Event discovery
│   ├── communities/       # Community pages
│   ├── bounties/          # Bounty system
│   └── dashboard/         # User dashboard
├── components/            # React components
├── lib/                   # Utility functions
│   └── sui-contracts.ts   # Contract configuration
├── hooks/                 # React hooks
│   └── useSuiContracts.ts # Contract interaction hooks
├── suilens_contracts/     # Move smart contracts
│   └── sources/          # Contract modules
└── docs/                 # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Sui Foundation for blockchain infrastructure
- Move language documentation and examples
- Community contributors and testers

## 📞 Support

- Create an issue for bug reports
- Join our Discord for community support
- Follow us on Twitter for updates

---

Built with ❤️ for the Sui ecosystem