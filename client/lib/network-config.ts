import { getFullnodeUrl } from '@mysten/sui/client';

// Supported network types
export type SuiNetwork = 'testnet' | 'mainnet' | 'devnet' | 'localnet';

// Enoki supported network types (Enoki only supports testnet and mainnet)
export type EnokiNetwork = 'testnet' | 'mainnet';

/**
 * Centralized network configuration for SUI Lens
 * Supports multiple network environments
 */
export const NETWORK_CONFIG = {
  // Get network from environment variable, default to testnet
  get network(): SuiNetwork {
    const envNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK;
    const networkValue = (envNetwork as SuiNetwork) || 'testnet';
    console.log('Current SUI Network:', networkValue);
    return networkValue;
  },

  // Get fullnode URL based on network
  get fullnodeUrl(): string {
    return getFullnodeUrl(this.network);
  },

  // Check if we're on mainnet
  get isMainnet(): boolean {
    return this.network === 'mainnet';
  },

  // Gas configuration
  gasConfig: {
    // Default gas budget (0.1 SUI = 100000000 MIST)
    defaultGasBudget: 100000000,
    // Minimum gas budget (0.01 SUI = 10000000 MIST)
    minGasBudget: 10000000,
    // Maximum gas budget (1 SUI = 1000000000 MIST)
    maxGasBudget: 1000000000
  }
};

// Contract addresses for different networks (updated after latest deployment)
export const CONTRACT_ADDRESSES = {
  testnet: {
    packageId: '0x3917618b284c87b21228aee3b0c6b2a4edb307d11cd430b99615c0d1e935d8b1',
    eventRegistryId: '0xf989d1c10dcfccd8dfd83d98c457564a4d484c5b70b2ccd22eef3062b8553899',
    poapRegistryId: '0x0d51f8513b9246b877068f73c3bce74b17f3aa76d2a456ea2ebe8992fb4b57b3',
    bountyRegistryId: '0x2d86e348463281b24b9ae39e5e83cb7a99c1ec1ae005c4547128d9719402b65b',
    communityRegistryId: '0xfbffdf785067164c3520ad903e4bc1d4727cec087031ee0eb8c4392b7726fcf8c',
  },
  mainnet: {
    // Updated Mainnet addresses (Deployed 2025-08-16 with POAP during event)
    packageId: '0x3a53fa6a6c29fb320ee88a4501239fa4bf1aa009828b7536961374f3027ea785',
    eventRegistryId: '0xb7bd4798b79970aa2dcbf2579bb36010a9b0bc0720ec6a4c1e8d03a544d575b5',
    poapRegistryId: '0xf1b3a3c77e7c4bf866d031d233a1ac65fa46bf8f1b9e1ad1c9684b4b079549ee',
    bountyRegistryId: '0xa2533b178625d9f0b7ab09fad4ff7d7dd28ecb07e15fb2a02e967446177e565d',
    communityRegistryId: '0x02dd14942cbb3ba0e8693b9c8517b96f0a4a712f443b1b866f3f6efd970dab76',
  },
  devnet: {
    // TODO: Update with devnet addresses when deployed
    packageId: '',
    eventRegistryId: '',
    poapRegistryId: '',
    bountyRegistryId: '',
    communityRegistryId: '',
  },
  localnet: {
    // TODO: Update with localnet addresses when deployed
    packageId: '',
    eventRegistryId: '',
    poapRegistryId: '',
    bountyRegistryId: '',
    communityRegistryId: '',
  }
};

// Get contract addresses for current network
export function getContractAddresses(network: SuiNetwork = NETWORK_CONFIG.network) {
  return CONTRACT_ADDRESSES[network] || CONTRACT_ADDRESSES.testnet;
}

/**
 * Get network-specific configuration
 */
export function getNetworkConfig() {
  return NETWORK_CONFIG;
}

/**
 * Validate if a network is supported
 */
export function isSupportedNetwork(network: string): boolean {
  return ['testnet', 'mainnet', 'devnet', 'localnet'].includes(network);
}

/**
 * Get Enoki network configuration
 * Converts network string to proper Enoki network type
 * Enoki only supports testnet and mainnet, defaults to testnet for other networks
 */
export function getEnokiNetwork(): EnokiNetwork {
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK;
  const suiNetwork = (network as SuiNetwork) || 'testnet';
  
  // Enoki only supports testnet and mainnet
  if (suiNetwork === 'testnet' || suiNetwork === 'mainnet') {
    return suiNetwork;
  }
  
  // Default to testnet for unsupported networks
  return 'testnet';
}
