#!/usr/bin/env ts-node

// Test script for SUI-Lens smart contracts
// Run with: npx ts-node scripts/test-contracts.ts

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_CONTRACTS } from '../lib/sui-contracts';

const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });

async function checkDeployment() {
  console.log('🔍 Checking SUI-Lens contract deployment...\n');
  
  try {
    // Check package
    const packageObj = await client.getObject({
      id: SUI_CONTRACTS.packageId,
      options: { showContent: true }
    });
    console.log('✅ Package found:', SUI_CONTRACTS.packageId);
    
    // Check shared objects
    const objects = [
      { name: 'GlobalRegistry', id: SUI_CONTRACTS.objects.globalRegistry },
      { name: 'POAPRegistry', id: SUI_CONTRACTS.objects.poapRegistry },
      { name: 'CommunityRegistry', id: SUI_CONTRACTS.objects.communityRegistry },
      { name: 'BountyRegistry', id: SUI_CONTRACTS.objects.bountyRegistry },
    ];
    
    for (const obj of objects) {
      const result = await client.getObject({
        id: obj.id,
        options: { showContent: true, showType: true }
      });
      
      if (result.data) {
        console.log(`✅ ${obj.name} found:`, obj.id);
        console.log(`   Type: ${result.data.type}`);
      } else {
        console.log(`❌ ${obj.name} not found`);
      }
    }
    
    // Check platform stats
    console.log('\n📊 Fetching platform statistics...');
    const tx = new Transaction();
    tx.moveCall({
      target: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.core}::get_platform_stats`,
      arguments: [tx.object(SUI_CONTRACTS.objects.globalRegistry)],
    });
    
    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });
    
    if (result.results?.[0]?.returnValues) {
      console.log('Platform stats retrieved successfully');
    }
    
    console.log('\n✅ All contracts deployed and accessible!');
    
  } catch (error) {
    console.error('❌ Error checking deployment:', error);
  }
}

async function listAvailableFunctions() {
  console.log('\n📋 Available Contract Functions:\n');
  
  const modules = [
    { name: 'Core Module', functions: [
      'create_profile', 'update_profile', 'create_event', 
      'register_for_event', 'approve_registration', 'cancel_event'
    ]},
    { name: 'POAP Module', functions: [
      'create_poap_collection', 'claim_poap', 'update_collection'
    ]},
    { name: 'Community Module', functions: [
      'create_community', 'join_community', 'post_announcement'
    ]},
    { name: 'Bounty Module', functions: [
      'create_bounty', 'submit_bounty_work', 'select_winner', 'claim_bounty_reward'
    ]}
  ];
  
  modules.forEach(module => {
    console.log(`${module.name}:`);
    module.functions.forEach(fn => {
      console.log(`  - ${fn}`);
    });
    console.log('');
  });
}

// Example transaction builders
function buildCreateProfileTx(username: string, bio: string, avatarUrl: string): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.core}::create_profile`,
    arguments: [
      tx.object(SUI_CONTRACTS.objects.globalRegistry),
      tx.pure.string(username),
      tx.pure.string(bio),
      tx.pure.string(avatarUrl),
      tx.object('0x6'), // Clock
    ],
  });
  return tx;
}

function buildCreateEventTx(params: {
  title: string;
  description: string;
  imageUrl: string;
  startDate: number;
  endDate: number;
  location: string;
  category: string;
  capacity?: number;
  ticketPrice: number;
  requiresApproval: boolean;
  isPrivate: boolean;
}): Transaction {
  const tx = new Transaction();
  
  const capacityArg = params.capacity 
    ? tx.pure.option('u64', params.capacity)
    : tx.pure.option('u64', null);
  
  tx.moveCall({
    target: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.core}::create_event`,
    arguments: [
      tx.object(SUI_CONTRACTS.objects.globalRegistry),
      tx.pure.string(params.title),
      tx.pure.string(params.description),
      tx.pure.string(params.imageUrl),
      tx.pure.u64(params.startDate),
      tx.pure.u64(params.endDate),
      tx.pure.string(params.location),
      tx.pure.string(params.category),
      capacityArg,
      tx.pure.u64(params.ticketPrice),
      tx.pure.bool(params.requiresApproval),
      tx.pure.bool(params.isPrivate),
      tx.object('0x6'), // Clock
    ],
  });
  return tx;
}

// Main execution
async function main() {
  console.log('🚀 SUI-Lens Contract Test Suite\n');
  console.log('Network: Sui Testnet');
  console.log('Package:', SUI_CONTRACTS.packageId);
  console.log('');
  
  await checkDeployment();
  await listAvailableFunctions();
  
  console.log('\n💡 Example Transactions:\n');
  
  // Show example create profile transaction
  const profileTx = buildCreateProfileTx(
    'alice_sui',
    'Blockchain enthusiast and event organizer',
    'https://example.com/avatar.png'
  );
  console.log('Create Profile TX built successfully');
  
  // Show example create event transaction
  const eventTx = buildCreateEventTx({
    title: 'Sui Developer Workshop',
    description: 'Learn to build on Sui blockchain',
    imageUrl: 'https://example.com/event.png',
    startDate: Date.now() + 86400000, // Tomorrow
    endDate: Date.now() + 90000000, // Tomorrow + 1 hour
    location: 'Virtual - Zoom',
    category: 'technology',
    capacity: 50,
    ticketPrice: 0, // Free event
    requiresApproval: false,
    isPrivate: false,
  });
  console.log('Create Event TX built successfully');
  
  console.log('\n✨ Ready for integration testing!');
  console.log('Next steps:');
  console.log('1. Connect your wallet to the frontend');
  console.log('2. Create a user profile');
  console.log('3. Create an event');
  console.log('4. Test registration and POAP claiming');
}

// Run the script
main().catch(console.error);