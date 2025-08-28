const { SuiClient } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');
const { toBase64 } = require('@mysten/sui/utils');

async function testSponsorshipDryRun() {
    console.log('Testing sponsorship dry run issue...');
    
    // Create a simple test transaction
    const tx = new Transaction();
    tx.moveCall({
        target: '0x80a710472adc37cc6deced075780f2ac44a0e8cad534f4edc1c1e2f994878c7b::suilens_core::create_profile',
        arguments: [
            tx.object('0x12f90051dda087ff0767c890cfb1b226ca7f5b20ba9022c8e3523a4bec01eaf2'),
            tx.pure.string('test-user'),
            tx.pure.string('Test bio'),
            tx.pure.string('https://example.com/avatar.png'),
            tx.object('0x6'),
        ],
    });

    // Build transaction bytes
    const suiClient = new SuiClient({
        url: 'https://fullnode.mainnet.sui.io:443',
    });

    const txBytes = await tx.build({
        onlyTransactionKind: true,
        client: suiClient,
    });

    const txBase64 = toBase64(txBytes);
    console.log('Transaction bytes (base64):', txBase64.substring(0, 100) + '...');
    console.log('Transaction bytes length:', txBytes.length);

    // Test sponsorship request
    const testAddress = '0x2c8b37900920895ea22ba93a70714fd311e905c8421ecaa808f99570630593df';
    
    const sponsorResponse = await fetch(
        'http://localhost:3009/api/sponsor/sponsor-transaction',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transactionKindBytes: txBase64,
                sender: testAddress,
                network: 'mainnet',
                allowedAddresses: [testAddress],
            }),
        }
    );

    console.log('Sponsorship response status:', sponsorResponse.status);
    
    if (!sponsorResponse.ok) {
        const error = await sponsorResponse.json();
        console.error('Sponsorship failed:', error);
        return;
    }

    const sponsorData = await sponsorResponse.json();
    console.log('Sponsorship successful:', sponsorData);
}

testSponsorshipDryRun().catch(console.error);
