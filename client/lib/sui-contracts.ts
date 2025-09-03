// SUI-Lens Smart Contract Configuration
// Deployed on Sui Mainnet

export const SUI_CONTRACTS = {
  network: 'mainnet',
  packageId: '0xfb8bf946e9d5384f8e359de223da090ef54ff4cfab65c7f96221350dd47ab634',

  // Module names
  modules: {
    core: 'suilens_core',
    poap: 'suilens_poap',
    community: 'suilens_community',
    bounty: 'suilens_bounty'
  },

  // Shared objects - Updated Mainnet addresses (Deployed 2025-08-16 with POAP during event)
  objects: {
    globalRegistry: '0x7c54f29a275f5441cab9f59b8328ce5a76854c504149e149b39930f7e381c996',
    poapRegistry: '0x33561211cc9752ba604e2f106a14228d4616dfb7243a511b9c9e60e0ca94bc49',
    communityRegistry: '0x02dd14942cbb3ba0e8693b9c8517b96f0a4a712f443b1b866f3f6efd970dab76',
    bountyRegistry: '0xa2533b178625d9f0b7ab09fad4ff7d7dd28ecb07e15fb2a02e967446177e565d'
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