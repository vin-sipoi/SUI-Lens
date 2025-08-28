const { SuiClient } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');
const { toBase64 } = require('@mysten/sui/utils');

async function testSimpleCoinTransfer() {
    console.log('Testing simple coin transfer transaction...');
    
    const suiClient = new SuiClient({
        url: 'https://fullnode.mainnet.sui.io:443',
    });

    // Create a simple transfer transaction
    const tx = new Transaction();
    
    // Transfer 0.001 SUI to a test address
    const [coin] = tx.splitCoins(tx.gas, [1000000]); // 0.001 SUI
    tx.transferObjects([coin], '0x2c8b37900920895ea22ba93a70714fd311e905c8421ecaa808f99570630593df');

    // Build transaction bytes
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

testSimpleCoinTransfer().catch(console.error);
