
"use client";

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Initialize SuiClient for testnet
const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

export { suiClient };

export class SuilensService {
  private client: SuiClient;
  private packageId: string;
  private eventRegistryId: string;
  private poapRegistryId: string;
  private bountyPackageId: string;
  private bountyRegistryId: string;

  constructor(client: SuiClient, packageId: string) {
    this.client = client;
    this.packageId = packageId;
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
    const tx = new TransactionBlock();

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

  async mintPOAP(eventObjectId: string, userAddress: string) {
    if (!userAddress) {
      throw new Error('User not connected');
    }

    const tx = new TransactionBlock();

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
      return await this.client.getObject({
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
    if (!userAddress) {
      throw new Error('User not connected');
    }

    try {
      return await this.client.getOwnedObjects({
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
      const events = await this.client.getDynamicFields({
        parentId: this.eventRegistryId,
      });
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  async registerForEvent(eventId: string, userAddress: string) {
    if (!userAddress) {
      throw new Error('User not connected');
    }

    const tx = new TransactionBlock();

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
    if (!userAddress) {
      throw new Error('User not connected');
    }

    try {
      // Placeholder: Adjust based on your Move contract implementation
      return {
        isRegistered: false,
        registrationTime: null,
      };
    } catch (error) {
      console.error('Error checking registration:', error);
      throw new Error('Failed to check registration status');
    }
  }

  async createEventWithRewardPool(
    eventData: {
      name: string;
      description: string;
      startTime: number;
      endTime: number;
      maxAttendees: number;
      poapTemplate: string;
    },
    rewardPoolData?: {
      amount: number;
      maxParticipants: number;
    }
  ) {
    const tx = new TransactionBlock();

    if (rewardPoolData) {
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
      return this.createEvent(eventData);
    }

    return tx;
  }
}

export const suilensService = new SuilensService(suiClient, process.env.NEXT_PUBLIC_PACKAGE_ID || '');

// Helper function for minting POAP
export async function mintPOAP(
  eventId: string,
  name: string,
  imageUrl: string,
  metadata: string,
  attendeeAddress: string,
  packageId?: string
) {
  const tx = new TransactionBlock();

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
  timestampToSui: (timestamp: number): number => {
    return Math.floor(timestamp / 1000); // Convert to seconds
  },

  suiToTimestamp: (suiTimestamp: number): number => {
    return suiTimestamp * 1000; // Convert to milliseconds
  },

  isValidSuiAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  },

  formatAddress: (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
};

// Type definitions
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

export interface Bounty {
  id: string;
  reward_amount: number;
  status: string;
}

export type TransactionResult = {
  effects: any;
  events: any;
};
