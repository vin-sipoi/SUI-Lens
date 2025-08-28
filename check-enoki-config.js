// Check Enoki configuration and test basic connectivity
const { EnokiClient } = require('@mysten/enoki');

async function checkEnokiConfig() {
    console.log('Checking Enoki configuration...');
    
    // Check if ENOKI_PRIVATE_KEY is set
    const enokiKey = process.env.ENOKI_PRIVATE_KEY;
    if (!enokiKey) {
        console.error('❌ ENOKI_PRIVATE_KEY environment variable is not set');
        return;
    }
    
    console.log('✅ ENOKI_PRIVATE_KEY is set');
    console.log('Key starts with:', enokiKey.substring(0, 20) + '...');
    console.log('Key length:', enokiKey.length);
    
    try {
        // Test basic Enoki client initialization
        const enokiClient = new EnokiClient({
            apiKey: enokiKey,
        });
        
        console.log('✅ Enoki client initialized successfully');
        
        // Test network connectivity
        console.log('\nTesting network connectivity...');
        
        // Try a simple health check or test endpoint
        const testResponse = await fetch('https://api.enoki.mystenlabs.com/v1/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log('Enoki API health check status:', testResponse.status);
        
        if (testResponse.ok) {
            const healthData = await testResponse.json();
            console.log('✅ Enoki API is healthy:', healthData);
        } else {
            console.error('❌ Enoki API health check failed');
        }
        
    } catch (error) {
        console.error('❌ Enoki client initialization failed:', error.message);
        console.error('Error details:', error);
    }
}

checkEnokiConfig().catch(console.error);
