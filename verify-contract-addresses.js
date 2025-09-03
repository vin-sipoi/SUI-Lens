// Verify that the contract addresses are correct and accessible
const { SuiClient } = require('@mysten/sui/client');

async function verifyContractAddresses() {
    console.log('Verifying contract addresses on mainnet...');
    
    const suiClient = new SuiClient({
        url: 'https://fullnode.mainnet.sui.io:443',
    });

    const addresses = {
        packageId: '0xfcfdddeed4ac04a41fcc73d25ef60921e162f5695dde54f8aa75a00cb00fd785',
        eventRegistryId: '0x1105bf30871e34e7a2ad640c75d55f37774f81cf6d06ad79a50528008b8bf6f1',
        poapRegistryId: '0x923f241a8721bb3e35e171bbc6a81f194f80be33571bf00c77d1d18b87e21260'
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
