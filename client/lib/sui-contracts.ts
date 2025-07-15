// SUI-Lens Smart Contract Configuration
// Deployed on Sui Testnet

export const SUI_CONTRACTS = {
  network: 'testnet',
  packageId: '0x0687d19707ad6528234f3f1c6a58d8085b483ef629cbbbd8983fbf095fa30082',
  
  // Module names
  modules: {
    core: 'suilens_core',
    poap: 'suilens_poap',
    community: 'suilens_community',
    bounty: 'suilens_bounty'
  },
  
  // Shared objects
  objects: {
    globalRegistry: '0x6bb54788b079f5074f80cdfb5d5b48b7d487f021bf4d1d73eb98d9fff3ff88d9',
    poapRegistry: '0x509f0748bbe1b4cee12b8fea9da45cddf7153b6382e8fb10015d3c149154a4e8',
    communityRegistry: '0xf92f5314c80e38cb73046cf34d597bedfb27df0aa2725289dfdfe039a2da2f22',
    bountyRegistry: '0x4412dd37dc7660ff5b3b77ac5951200385fb8b4cce6e11cf4bfe72b441b7605f'
  },
  
  // Admin capabilities
  admin: {
    adminCap: '0x6c7b702dd93c43c320138c49f3f1c73e78e643d6a670e3adbcf95ae30d3ac4e3',
    upgradeCap: '0x7a46ed263f24324e0043429e075c77577402c44ec628c5251cfa1ac0fc1c696b',
    publisher: '0xa523790a847e646749953f7efcdfc07a02e8fcfcbed05f67a74362741238a061',
    poapDisplay: '0x55de5635a7ef92392fee79115908fdb6d0fb095923e7585595aaebd8994b6133'
  },
  
  // Platform configuration
  platform: {
    platformFeeRate: 250, // 2.5% in basis points
    deployer: '0x4822bfc9c86d1a77daf48b0bdf8f012ae9b7f8f01b4195dc0f3fd4fb838525bd'
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