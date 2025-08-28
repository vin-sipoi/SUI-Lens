const { EnokiClient } = require('@mysten/enoki');
const fetch = require('node-fetch');

async function testEventCreation() {
    const enokiKey = process.env.ENOKI_PRIVATE_KEY;
    const enokiClient = new EnokiClient({ apiKey: enokiKey });

    // Define event data
    const eventData = {
        title: "Test Event",
        description: "This is a test event for sponsorship.",
        date: "2023-12-01",
        time: "10:00",
        location: "Virtual",
        category: "Test",
        capacity: 100,
        ticketPrice: 0,
        requiresApproval: false,
    };

    // Create a transaction for the event
    const tx = await enokiClient.createSponsoredTransaction({
        network: 'testnet',
        transactionKindBytes: JSON.stringify(eventData), // Simplified for testing
        sender: "0xYourSenderAddress", // Replace with a valid address
    });

    console.log('Transaction created:', tx);
}

testEventCreation().catch(console.error);
