#!/usr/bin/env node

const { Transaction } = require('@mysten/sui/transactions');
const { toB64 } = require('@mysten/sui/utils');
const { SuiClient, getFullnodeUrl } = require('@mysten/sui/client');
const fetch = require('node-fetch');

// Configuration - replace with your actual values
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '0x80a710472adc37cc6deced075780f2ac44a0e8cad534f4edc1c1e2f994878c7b';
const EVENT_REGISTRY_ID = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || '0xYOUR_EVENT_REGISTRY_ID_HERE';
const SENDER_ADDRESS = '0x00000000000000000000000000000000000000000000';
const BACKEND_URL = 'http://localhost:3009';

// Initialize Sui client
const suiClient = new SuiClient({
  url: getFullnodeUrl('mainnet')
});

async function testSponsorship() {
  try {
    console.log('🧪 Testing Sponsorship Functionality');
    console.log('====================================');
    
    // Test 1: Check backend health
    console.log('\n1. Checking backend health...');
    try {
      const healthResponse = await fetch(`${BACKEND_URL}/api/sponsor/health`);
      const healthData = await healthResponse.json();
      console.log('✅ Backend health:', healthData);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
    }

    // Test 2: Create a transaction for create_event
    console.log('\n2. Creating transaction...');
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

    console.log('✅ Transaction created successfully');

    // Test 3: Build transaction bytes
    console.log('\n3. Building transaction bytes...');
    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    console.log('✅ Transaction bytes built successfully');
    console.log('Transaction bytes length:', txBytes.length);

    // Test 4: Convert to base64
    const transactionKindBytes = toB64(txBytes);
    console.log('✅ Transaction kind bytes generated');

    // Test 5: Test sponsorship endpoint
    console.log('\n5. Testing sponsorship endpoint...');
    const sponsorPayload = {
      transactionKindBytes,
      sender: SENDER_ADDRESS,
      allowedMoveCallTargets: [`${PACKAGE_ID}::suilens_core::create_event`],
      network: 'mainnet'
    };

    console.log('Sponsorship payload:', JSON.stringify(sponsorPayload, null, 2));

    try {
      const sponsorResponse = await fetch(`${BACKEND_URL}/api/sponsor/sponsor-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sponsorPayload),
      });

      if (!sponsorResponse.ok) {
        const error = await sponsorResponse.json();
        console.log('❌ Sponsorship failed:', error);
        throw new Error(`Sponsorship failed: ${JSON.stringify(error)}`);
      }

      const sponsorResult = await sponsorResponse.json();
      console.log('✅ Sponsorship successful:', sponsorResult);

      // Test 6: Test execution endpoint (would need signature)
      console.log('\n6. Testing execution endpoint (would need signature)...');
      console.log('Execution would require a valid signature from the user');
      console.log('Sponsored transaction digest:', sponsorResult.digest);

    } catch (error) {
      console.log('❌ Sponsorship test failed:', error.message);
      
      // Check if it's a validation error
      if (error.message.includes('Validation failed')) {
        console.log('This might be due to:');
        console.log('1. Invalid transactionKindBytes format');
        console.log('2. Missing required fields in the payload');
        console.log('3. Enoki not configured on the server');
      } else if (error.message.includes('Enoki not configured')) {
        console.log('Enoki is not configured on the server. Check ENOKI_PRIVATE_KEY environment variable.');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// If run directly, execute the function
if (require.main === module) {
  testSponsorship().catch(console.error);
}

module.exports = { testSponsorship };
