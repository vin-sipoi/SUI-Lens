#!/usr/bin/env node

const { Transaction } = require('@mysten/sui/transactions');
const { toB64 } = require('@mysten/sui/utils');
const { SuiClient, getFullnodeUrl } = require('@mysten/sui/client');

// Configuration - replace with your actual values
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '0x80a710472adc37cc6deced075780f2ac44a0e8cad534f4edc1c1e2f994878c7b';
const EVENT_REGISTRY_ID = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || 'YOUR_EVENT_REGISTRY_ID';
const SENDER_ADDRESS = '0x00000000000000000000000000000000000000000000';

// Initialize Sui client
const suiClient = new SuiClient({
  url: getFullnodeUrl('mainnet')
});

async function debugTransaction() {
  try {
    console.log('🔍 Debugging transaction creation...');
    console.log('Package ID:', PACKAGE_ID);
    console.log('Event Registry ID:', EVENT_REGISTRY_ID);
    console.log('Sender Address:', SENDER_ADDRESS);

    // Create a transaction for create_event
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::suilens_core::create_event`,
      arguments: [
        tx.object(EVENT_REGISTRY_ID),
        tx.pure.string('Test Event'),
        tx.pure.string('This is a test event for sponsorship'),
        tx.pure.string('https://example.com/banner.jpg'),
        tx.pure.string('https://example.com/nft.jpg'),
        tx.pure.string('https://example.com/poap.jpg'),
        tx.pure.u64(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
        tx.pure.u64(Math.floor(Date.now() / 1000) + 7200), // 2 hours from now
        tx.pure.string('Virtual Event'),
        tx.pure.string('Community'),
        tx.pure.option('u64', 100), // maxAttendees
        tx.pure.u64(0), // ticketPrice
        tx.pure.bool(false), // requiresApproval
        tx.pure.bool(false), // is_private
        tx.object('0x6'), // Clock object
      ],
    });

    console.log('📋 Transaction created successfully');

    // Build the transaction bytes
    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    console.log('✅ Transaction bytes built successfully');
    console.log('Transaction bytes length:', txBytes.length);

    // Convert to base64
    const transactionKindBytes = toB64(txBytes);
    
    console.log('Generated transactionKindBytes:', transactionKindBytes);
    console.log('\nCURL command for testing:');
    console.log(`curl -X POST http://localhost:3009/api/sponsor/sponsor-transaction \\
  -H "Content-Type: application/json" \\
  -d '{
    "transactionKindBytes": "${transactionKindBytes}",
    "sender": "${SENDER_ADDRESS}",
    "allowedMoveCallTargets": ["${PACKAGE_ID}::suilens_core::create_event"],
    "network": "mainnet"
  }'`);

  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// If run directly, execute the function
if (require.main === module) {
  debugTransaction().catch(console.error);
}

module.exports = { debugTransaction };
