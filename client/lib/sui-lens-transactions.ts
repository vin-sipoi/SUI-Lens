/**
 * SUI-Lens Transaction Wrapper
 * Provides all contract functions with Enoki zkLogin signing support
 */

import { Transaction } from '@mysten/sui/transactions';
import { suilensService } from './sui-client';

export class SuiLensTransactions {
  /**
   * Event Creator Functions
   */
  
  // Create a new event (for creators)
  static async createEvent(eventData: {
    name: string;
    description: string;
    bannerUrl: string;
    nftImageUrl: string;
    poapImageUrl: string;
    location?: string;
    category?: string;
    startTime: number;
    endTime: number;
    maxAttendees: number;
    ticketPrice?: number;
    requiresApproval?: boolean;
  }) {
    return suilensService.createEvent({
      ...eventData,
      poapTemplate: eventData.name, // Use event name as default POAP template
    });
  }

  // Update event details (for creators)
  static async updateEvent(eventId: string, updates: {
    name?: string;
    description?: string;
    location?: string;
    maxAttendees?: number;
  }) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_core::update_event`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(eventId),
        tx.pure.string(updates.name || ''),
        tx.pure.string(updates.description || ''),
        tx.pure.string(updates.location || ''),
        tx.pure.u64(updates.maxAttendees || 0),
      ],
    });
    
    return tx;
  }

  // Cancel event (for creators)
  static async cancelEvent(eventId: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_core::cancel_event`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(eventId),
      ],
    });
    
    return tx;
  }

  // Approve attendee registration (for creators)
  static async approveAttendee(eventId: string, attendeeAddress: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_core::approve_registration`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(eventId),
        tx.pure.address(attendeeAddress),
      ],
    });
    
    return tx;
  }

  // Mark attendee as checked in (for creators/organizers)
  static async markAttendance(eventId: string, attendeeAddress: string) {
    return suilensService.markAttendance(eventId, attendeeAddress);
  }

  // Withdraw event funds (for creators)
  static async withdrawEventFunds(eventId: string) {
    return suilensService.withdrawEventFunds(eventId);
  }

  // Create POAP collection for event (for creators)
  static async createPOAPCollection(eventId: string, poapData: {
    name: string;
    description: string;
    imageUrl: string;
    maxSupply?: number;
  }) {
    return suilensService.createPOAPCollection(eventId, poapData);
  }

  /**
   * Attendee Functions
   */
  
  // Register for an event (for attendees)
  static async registerForEvent(eventId: string) {
    return suilensService.registerForEvent(eventId);
  }

  // Cancel registration (for attendees)
  static async cancelRegistration(eventId: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_core::cancel_registration`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(eventId),
      ],
    });
    
    return tx;
  }

  // Mint Event NFT (for registered attendees)
  static async mintEventNFT(eventId: string) {
    return suilensService.mintEventNFT(eventId);
  }

  // Claim POAP (for attendees who checked in)
  static async claimPOAP(eventId: string) {
    return suilensService.mintPOAP(eventId);
  }

  /**
   * User Profile Functions
   */
  
  // Create user profile
  static async createProfile(profileData: {
    username: string;
    bio: string;
    avatarUrl: string;
  }) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_core::create_profile`,
      arguments: [
        tx.object(registryId),
        tx.pure.string(profileData.username),
        tx.pure.string(profileData.bio),
        tx.pure.string(profileData.avatarUrl),
      ],
    });
    
    return tx;
  }

  // Update user profile
  static async updateProfile(updates: {
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_core::update_profile`,
      arguments: [
        tx.object(registryId),
        tx.pure.string(updates.username || ''),
        tx.pure.string(updates.bio || ''),
        tx.pure.string(updates.avatarUrl || ''),
      ],
    });
    
    return tx;
  }

  // Add social link to profile
  static async addSocialLink(platform: string, url: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_core::add_social_link`,
      arguments: [
        tx.object(registryId),
        tx.pure.string(platform),
        tx.pure.string(url),
      ],
    });
    
    return tx;
  }

  /**
   * Community Functions
   */
  
  // Create a community
  static async createCommunity(communityData: {
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    rules: string[];
    requiresApproval: boolean;
  }) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_COMMUNITY_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_community::create_community`,
      arguments: [
        tx.object(registryId),
        tx.pure.string(communityData.name),
        tx.pure.string(communityData.description),
        tx.pure.string(communityData.imageUrl),
        tx.pure.string(communityData.category),
        tx.pure.vector('string', communityData.rules),
        tx.pure.bool(communityData.requiresApproval),
        tx.object('0x6'), // Clock
      ],
    });
    
    return tx;
  }

  // Join a community
  static async joinCommunity(communityId: string, message?: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_COMMUNITY_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_community::join_community`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(communityId),
        tx.pure.string(message || ''),
        tx.object('0x6'), // Clock
      ],
    });
    
    return tx;
  }

  // Leave a community
  static async leaveCommunity(communityId: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_COMMUNITY_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_community::leave_community`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(communityId),
      ],
    });
    
    return tx;
  }

  /**
   * Bounty Functions
   */
  
  // Create a bounty
  static async createBounty(bountyData: {
    title: string;
    description: string;
    requirements: string;
    category: string;
    reward: number;
    deadline: number;
    maxWinners: number;
  }) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_BOUNTY_REGISTRY_ID || '';
    
    // Split coins for the reward
    const [coin] = tx.splitCoins(tx.gas, [0]);
    
    tx.moveCall({
      target: `${packageId}::suilens_bounty::create_bounty`,
      arguments: [
        tx.object(registryId),
        tx.pure.string(bountyData.title),
        tx.pure.string(bountyData.description),
        tx.pure.string(bountyData.requirements),
        tx.pure.string(bountyData.category),
        coin,
        tx.pure.u64(bountyData.deadline),
        tx.pure.u64(bountyData.maxWinners),
        tx.object('0x6'), // Clock
      ],
    });
    
    return tx;
  }

  // Submit work for a bounty
  static async submitBountyWork(bountyId: string, submission: {
    title: string;
    description: string;
    submissionUrl: string;
  }) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_BOUNTY_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_bounty::submit_bounty_work`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(bountyId),
        tx.pure.string(submission.title),
        tx.pure.string(submission.description),
        tx.pure.string(submission.submissionUrl),
        tx.object('0x6'), // Clock
      ],
    });
    
    return tx;
  }

  // Select bounty winner (for bounty creator)
  static async selectBountyWinner(bountyId: string, submissionId: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_BOUNTY_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_bounty::select_winner`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(bountyId),
        tx.pure.id(submissionId),
        tx.object('0x6'), // Clock
      ],
    });
    
    return tx;
  }

  // Claim bounty reward (for winner)
  static async claimBountyReward(bountyId: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_BOUNTY_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_bounty::claim_bounty_reward`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(bountyId),
      ],
    });
    
    return tx;
  }

  /**
   * Waitlist Functions
   */
  
  // Join event waitlist
  static async joinWaitlist(eventId: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_core::join_waitlist`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(eventId),
        tx.object('0x6'), // Clock
      ],
    });
    
    return tx;
  }

  // Leave waitlist
  static async leaveWaitlist(eventId: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_core::leave_waitlist`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(eventId),
      ],
    });
    
    return tx;
  }

  // Promote from waitlist (for creators)
  static async promoteFromWaitlist(eventId: string, userAddress: string) {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    const registryId = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '';
    
    tx.moveCall({
      target: `${packageId}::suilens_core::promote_from_waitlist`,
      arguments: [
        tx.object(registryId),
        tx.pure.id(eventId),
        tx.pure.address(userAddress),
        tx.object('0x6'), // Clock
      ],
    });
    
    return tx;
  }
}

// Export as default for convenience
export default SuiLensTransactions;