// SUI-Lens Smart Contract Configuration
// Deployed on Sui Mainnet

export const SUI_CONTRACTS = {
  network: 'mainnet',
  packageId: '0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c',
  
  // Module names
  modules: {
    core: 'suilens_core',
    poap: 'suilens_poap',
    community: 'suilens_community',
    bounty: 'suilens_bounty'
  },
  
  // Shared objects
  objects: {
    globalRegistry: '0x31ff956c2a7983edb450237628a363780c2651fff956f6c9aec9969b66f97c92',
    poapRegistry: '0xc8dd38a9b655f355e5de22514ede961b219722eaada1c36d980fc085dcb571a3',
    communityRegistry: '0x9a5a7f1a40761a7e2487723251e043c11ce60432c6c19142717d6e20a3e4710b',
    bountyRegistry: '0xe48bfa0fb21c9200de91b7d7662a38db91dbe837bd5498178e47175621366a3e'
  },
  
  // Admin capabilities (update when available)
  admin: {
    adminCap: '',
    upgradeCap: '',
    publisher: '',
    poapDisplay: ''
  },
  
  // Platform configuration
  platform: {
    platformFeeRate: 250, // 2.5% in basis points
    deployer: '0x9a5b0ad3a18964ab7c0dbf9ab4cdecfd6b3899423b47313ae6e78f4b801022a3'
  },
  
  // Contract functions
  functions: {
    // User Profile
    createProfile: 'create_profile',
    updateProfile: 'update_profile',
    addSocialLink: 'add_social_link',
    
    // Event Management
    createEvent: 'create_event',
    registerForEvent: 'register_for_event',
    approveRegistration: 'approve_registration',
    cancelRegistration: 'cancel_registration',
    updateEvent: 'update_event',
    cancelEvent: 'cancel_event',
    
    // POAP Functions
    createPoapCollection: 'create_poap_collection',
    claimPoap: 'claim_poap',
    updateCollection: 'update_collection',
    deactivateCollection: 'deactivate_collection',
    
    // Community Functions
    createCommunity: 'create_community',
    joinCommunity: 'join_community',
    approveJoinRequest: 'approve_join_request',
    leaveCommunity: 'leave_community',
    addModerator: 'add_moderator',
    postAnnouncement: 'post_announcement',
    addCommunityEvent: 'add_community_event',
    updateCommunity: 'update_community',
    
    // Bounty Functions
    createBounty: 'create_bounty',
    submitBountyWork: 'submit_bounty_work',
    selectWinner: 'select_winner',
    claimBountyReward: 'claim_bounty_reward',
    cancelBounty: 'cancel_bounty',
    addBountyMetadata: 'add_bounty_metadata',
    addSubmissionMetadata: 'add_submission_metadata',
    
    // View Functions
    getEvent: 'get_event',
    getUserProfile: 'get_user_profile',
    getPlatformStats: 'get_platform_stats',
    isRegistered: 'is_registered',
    getAttendeeCount: 'get_attendee_count',
    getEventCreator: 'get_event_creator',
    getEventEndDate: 'get_event_end_date',
    getEventTitle: 'get_event_title',
    getEventStartDate: 'get_event_start_date',
    getEventLocation: 'get_event_location',
    isApprovedAttendee: 'is_approved_attendee',
    hasUserProfile: 'has_user_profile'
  }
};

// Helper function to get contract call parameters
export function getContractCall(module: keyof typeof SUI_CONTRACTS.modules, functionName: string) {
  return {
    packageId: SUI_CONTRACTS.packageId,
    module: SUI_CONTRACTS.modules[module],
    function: functionName
  };
}

// Helper function to convert price to Move amount (1 SUI = 1_000_000_000 MIST)
export function toMoveAmount(sui: number): bigint {
  return BigInt(Math.floor(sui * 1_000_000_000));
}

// Helper function to convert Move amount to SUI
export function fromMoveAmount(mist: bigint | string | number): number {
  const amount = BigInt(mist);
  return Number(amount) / 1_000_000_000;
}

// Helper function to format date to Move timestamp (milliseconds)
export function toMoveTimestamp(date: Date): number {
  return date.getTime();
}

// Helper function to parse Move timestamp to Date
export function fromMoveTimestamp(timestamp: number | string): Date {
  return new Date(Number(timestamp));
}