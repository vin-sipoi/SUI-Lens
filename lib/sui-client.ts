import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

export { suiClient };

export class SuilensService {
  private packageId: string;
  private eventRegistryId: string;
  private poapRegistryId: string;
  private bountyPackageId: string;
  private bountyRegistryId: string;

  constructor() {
    this.packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    this.eventRegistryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    this.poapRegistryId = process.env.NEXT_PUBLIC_POAP_REGISTRY_ID || '';
    this.bountyPackageId = process.env.NEXT_PUBLIC_BOUNTY_PACKAGE_ID || '';
    this.bountyRegistryId = process.env.NEXT_PUBLIC_BOUNTY_REGISTRY_ID || '';
  }

  async createEvent(eventData: {
    name: string;
    description: string;
    startTime: number;
    endTime: number;
    maxAttendees: number;
    poapTemplate: string;
  }) {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::event_manager::create_event`,
      arguments: [
        tx.pure.string(eventData.name),
        tx.pure.string(eventData.description),
        tx.pure.u64(eventData.startTime),
        tx.pure.u64(eventData.endTime),
        tx.pure.u64(eventData.maxAttendees),
        tx.pure.string(eventData.poapTemplate),
        tx.object(this.eventRegistryId),
      ],
    });

    return tx;
  }

  async mintPOAP(eventObjectId: string) {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::poap::mint_poap`,
      arguments: [
        tx.object(eventObjectId),
        tx.object(this.poapRegistryId),
        tx.object('0x6'), // Clock object
      ],
    });

    return tx;
  }

  async getEventDetails(eventId: string) {
    try {
      return await suiClient.getObject({
        id: eventId,
        options: {
          showContent: true,
          showType: true,
        },
      });
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw new Error('Failed to fetch event details');
    }
  }

  async getUserPOAPs(userAddress: string) {
    try {
      // Query user's POAP objects
      return await suiClient.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${this.packageId}::poap::POAP`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });
    } catch (error) {
      console.error('Error fetching user POAPs:', error);
      throw new Error('Failed to fetch user POAPs');
    }
  }

  async getAllEvents() {
    try {
      // Query all events from the registry
      const events = await suiClient.getDynamicFields({
        parentId: this.eventRegistryId,
      });
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  async registerForEvent(eventId: string, userAddress: string) {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::event_manager::register_for_event`,
      arguments: [
        tx.object(eventId),
        tx.pure.address(userAddress),
      ],
    });

    return tx;
  }

  async checkEventRegistration(eventId: string, userAddress: string) {
    try {
      // This would depend on your Move contract implementation
      // For now, returning a mock response
      return {
        isRegistered: false,
        registrationTime: null,
      };
    } catch (error) {
      console.error('Error checking registration:', error);
      throw new Error('Failed to check registration status');
    }
  }

  async createEventWithRewardPool(eventData: {
    name: string;
    description: string;
    startTime: number;
    endTime: number;
    maxAttendees: number;
    poapTemplate: string;
  }, rewardPoolData?: {
    amount: number;
    maxParticipants: number;
  }) {
    const tx = new Transaction();
    
    if (rewardPoolData) {
      // Create event with reward pool using BOUNTY contract
      tx.moveCall({
        target: `${this.bountyPackageId}::event_bounty::create_event_with_rewards`,
        arguments: [
          tx.pure.string(eventData.name),
          tx.pure.string(eventData.description),
          tx.pure.u64(eventData.startTime),
          tx.pure.u64(eventData.endTime),
          tx.pure.u64(eventData.maxAttendees),
          tx.pure.string(eventData.poapTemplate),
          tx.pure.u64(rewardPoolData.amount),
          tx.pure.u64(rewardPoolData.maxParticipants),
          tx.object(this.bountyRegistryId),
        ],
      });
    } else {
      // Use your existing POAP contract for regular events
      return this.createEvent(eventData);
    }

    return tx;
  }

  async lockRewardPool(eventObjectId: string, amount: number) {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.bountyPackageId}::reward_pool::lock_funds`,
      arguments: [
        tx.object(eventObjectId),
        tx.pure.u64(amount),
        tx.object('0x6'), // Clock object
      ],
    });

    return tx;
  }

  async getRewardPoolStatus(eventObjectId: string) {
    try {
      return await suiClient.getObject({
        id: eventObjectId,
        options: {
          showContent: true,
          showType: true,
        },
      });
    } catch (error) {
      console.error('Error fetching reward pool status:', error);
      throw new Error('Failed to fetch reward pool status');
    }
  }

  async distributeRewards(eventObjectId: string, participants: string[]) {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.bountyPackageId}::reward_pool::distribute_rewards`,
      arguments: [
        tx.object(eventObjectId),
        tx.pure.vector('address', participants),
        tx.object('0x6'),
      ],
    });

    return tx;
  }

  async unlockRewardPool(eventObjectId: string) {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.bountyPackageId}::reward_pool::unlock_funds`,
      arguments: [
        tx.object(eventObjectId),
        tx.object('0x6'),
      ],
    });

    return tx;
  }
}

export const suilensService = new SuilensService();

// Helper function for minting POAP (updated signature to match usage)
export async function mintPOAP(
  eventId: string,
  name: string,
  imageUrl: string,
  metadata: string,
  attendeeAddress: string,
  packageId?: string
) {
  const tx = new Transaction();
  
  const actualPackageId = packageId || process.env.NEXT_PUBLIC_PACKAGE_ID || '';
  const poapRegistryId = process.env.NEXT_PUBLIC_POAP_REGISTRY_ID || '';
  
  tx.moveCall({
    target: `${actualPackageId}::poap::mint_poap`,
    arguments: [
      tx.pure.string(eventId),
      tx.pure.string(name),
      tx.pure.string(imageUrl),
      tx.pure.string(metadata),
      tx.pure.address(attendeeAddress),
      tx.object(poapRegistryId),
      tx.object('0x6'), // Clock object
    ],
  });

  return tx;
}

// Utility functions for working with Sui
export const suiUtils = {
  // Convert timestamp to Sui format
  timestampToSui: (timestamp: number): number => {
    return Math.floor(timestamp / 1000); // Convert to seconds
  },

  // Convert Sui timestamp to JS timestamp
  suiToTimestamp: (suiTimestamp: number): number => {
    return suiTimestamp * 1000; // Convert to milliseconds
  },

  // Validate Sui address
  isValidSuiAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  },

  // Format Sui address for display
  formatAddress: (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
};

// Export types for better TypeScript support
export interface EventData {
  id: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  maxAttendees: number;
  currentAttendees: number;
  poapTemplate: string;
  creator: string;
  isActive: boolean;
}

export interface POAPData {
  id: string;
  eventId: string;
  name: string;
  description: string;
  imageUrl: string;
  metadata: string;
  owner: string;
  mintedAt: number;
}

export interface RegistrationData {
  eventId: string;
  userAddress: string;
  registeredAt: number;
  isApproved: boolean;
}
