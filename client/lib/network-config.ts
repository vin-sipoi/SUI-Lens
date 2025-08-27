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
