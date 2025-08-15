/**
 * Custom hook for SUI-Lens transactions with Enoki zkLogin
 * Provides easy-to-use functions for all contract interactions
 */

'use client';

import { useEnokiTransaction } from './useEnokiTransaction';
import SuiLensTransactions from '@/lib/sui-lens-transactions';
import { toast } from 'sonner';

export function useSuiLensTransaction() {
  const { signAndExecuteTransaction, isConnected, address } = useEnokiTransaction();

  // Helper to execute any transaction
  const execute = async (
    transactionBuilder: Promise<any>,
    successMessage?: string,
    errorMessage?: string
  ) => {
    try {
      const tx = await transactionBuilder;
      const result = await signAndExecuteTransaction(tx);
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      toast.error(errorMessage || error.message || 'Transaction failed');
      throw error;
    }
  };

  return {
    // Connection status
    isConnected,
    address,

    // Event Creator Functions
    createEvent: async (eventData: Parameters<typeof SuiLensTransactions.createEvent>[0]) => {
      return execute(
        SuiLensTransactions.createEvent(eventData),
        'Event created successfully!',
        'Failed to create event'
      );
    },

    updateEvent: async (eventId: string, updates: Parameters<typeof SuiLensTransactions.updateEvent>[1]) => {
      return execute(
        SuiLensTransactions.updateEvent(eventId, updates),
        'Event updated successfully!',
        'Failed to update event'
      );
    },

    cancelEvent: async (eventId: string) => {
      return execute(
        SuiLensTransactions.cancelEvent(eventId),
        'Event cancelled successfully',
        'Failed to cancel event'
      );
    },

    approveAttendee: async (eventId: string, attendeeAddress: string) => {
      return execute(
        SuiLensTransactions.approveAttendee(eventId, attendeeAddress),
        'Attendee approved!',
        'Failed to approve attendee'
      );
    },

    markAttendance: async (eventId: string, attendeeAddress: string) => {
      return execute(
        SuiLensTransactions.markAttendance(eventId, attendeeAddress),
        'Attendance marked!',
        'Failed to mark attendance'
      );
    },

    withdrawEventFunds: async (eventId: string) => {
      return execute(
        SuiLensTransactions.withdrawEventFunds(eventId),
        'Funds withdrawn successfully!',
        'Failed to withdraw funds'
      );
    },

    createPOAPCollection: async (eventId: string, poapData: Parameters<typeof SuiLensTransactions.createPOAPCollection>[1]) => {
      return execute(
        SuiLensTransactions.createPOAPCollection(eventId, poapData),
        'POAP collection created!',
        'Failed to create POAP collection'
      );
    },

    // Attendee Functions
    registerForEvent: async (eventId: string) => {
      return execute(
        SuiLensTransactions.registerForEvent(eventId),
        'Successfully registered for event!',
        'Failed to register for event'
      );
    },

    cancelRegistration: async (eventId: string) => {
      return execute(
        SuiLensTransactions.cancelRegistration(eventId),
        'Registration cancelled',
        'Failed to cancel registration'
      );
    },

    mintEventNFT: async (eventId: string) => {
      return execute(
        SuiLensTransactions.mintEventNFT(eventId),
        'Event NFT minted successfully!',
        'Failed to mint Event NFT'
      );
    },

    claimPOAP: async (eventId: string) => {
      return execute(
        SuiLensTransactions.claimPOAP(eventId),
        'POAP claimed successfully!',
        'Failed to claim POAP'
      );
    },

    // User Profile Functions
    createProfile: async (profileData: Parameters<typeof SuiLensTransactions.createProfile>[0]) => {
      return execute(
        SuiLensTransactions.createProfile(profileData),
        'Profile created successfully!',
        'Failed to create profile'
      );
    },

    updateProfile: async (updates: Parameters<typeof SuiLensTransactions.updateProfile>[0]) => {
      return execute(
        SuiLensTransactions.updateProfile(updates),
        'Profile updated!',
        'Failed to update profile'
      );
    },

    addSocialLink: async (platform: string, url: string) => {
      return execute(
        SuiLensTransactions.addSocialLink(platform, url),
        'Social link added!',
        'Failed to add social link'
      );
    },

    // Community Functions
    createCommunity: async (communityData: Parameters<typeof SuiLensTransactions.createCommunity>[0]) => {
      return execute(
        SuiLensTransactions.createCommunity(communityData),
        'Community created successfully!',
        'Failed to create community'
      );
    },

    joinCommunity: async (communityId: string, message?: string) => {
      return execute(
        SuiLensTransactions.joinCommunity(communityId, message),
        'Joined community!',
        'Failed to join community'
      );
    },

    leaveCommunity: async (communityId: string) => {
      return execute(
        SuiLensTransactions.leaveCommunity(communityId),
        'Left community',
        'Failed to leave community'
      );
    },

    // Bounty Functions
    createBounty: async (bountyData: Parameters<typeof SuiLensTransactions.createBounty>[0]) => {
      return execute(
        SuiLensTransactions.createBounty(bountyData),
        'Bounty created successfully!',
        'Failed to create bounty'
      );
    },

    submitBountyWork: async (bountyId: string, submission: Parameters<typeof SuiLensTransactions.submitBountyWork>[1]) => {
      return execute(
        SuiLensTransactions.submitBountyWork(bountyId, submission),
        'Work submitted successfully!',
        'Failed to submit work'
      );
    },

    selectBountyWinner: async (bountyId: string, submissionId: string) => {
      return execute(
        SuiLensTransactions.selectBountyWinner(bountyId, submissionId),
        'Winner selected!',
        'Failed to select winner'
      );
    },

    claimBountyReward: async (bountyId: string) => {
      return execute(
        SuiLensTransactions.claimBountyReward(bountyId),
        'Bounty reward claimed!',
        'Failed to claim reward'
      );
    },

    // Waitlist Functions
    joinWaitlist: async (eventId: string) => {
      return execute(
        SuiLensTransactions.joinWaitlist(eventId),
        'Joined waitlist!',
        'Failed to join waitlist'
      );
    },

    leaveWaitlist: async (eventId: string) => {
      return execute(
        SuiLensTransactions.leaveWaitlist(eventId),
        'Left waitlist',
        'Failed to leave waitlist'
      );
    },

    promoteFromWaitlist: async (eventId: string, userAddress: string) => {
      return execute(
        SuiLensTransactions.promoteFromWaitlist(eventId, userAddress),
        'User promoted from waitlist!',
        'Failed to promote user'
      );
    },

    // Generic transaction execution (for custom transactions)
    executeTransaction: signAndExecuteTransaction,
  };
}

export default useSuiLensTransaction;