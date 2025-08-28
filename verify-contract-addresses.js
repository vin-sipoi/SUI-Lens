// Verify that the contract addresses are correct and accessible
const { SuiClient } = require('@mysten/sui/client');

async function verifyContractAddresses() {
    console.log('Verifying contract addresses on mainnet...');
    
    const suiClient = new SuiClient({
        url: 'https://fullnode.mainnet.sui.io:443',
    });

    const addresses = {
        packageId: '0x80a710472adc37cc6deced075780f2ac44a0e8cad534f4edc1c1e2f994878c7b',
        eventRegistryId: '0x12f90051dda087ff0767c890cfb1b226ca7f5b20ba9022c8e3523a4bec01eaf2',
        poapRegistryId: '0x4c4d3e96fa1b76eedb71aaf0d91649fae0a5bba51d4b4e1dccd6b1793b5dd3ef'
    };

    for (const [name, address] of Object.entries(addresses)) {
        try {
            console.log(`\nChecking ${name}: ${address}`);
            const object = await suiClient.getObject({
                id: address,
                options: {
                    showType: true,
                    showOwner: true,
                    showContent: true
                }
            });
            
            console.log(`✅ ${name} exists:`);
            console.log(`   Type: ${object.data?.type}`);
            console.log(`   Owner: ${object.data?.owner}`);
            console.log(`   Status: ${object.data?.status}`);
            
        } catch (error) {
            console.error(`❌ ${name} error:`, error.message);
            if (error.message.includes('not exist')) {
                console.error(`   Address ${address} does not exist on mainnet`);
            }
        }
    }
}

verifyContractAddresses().catch(console.error);
