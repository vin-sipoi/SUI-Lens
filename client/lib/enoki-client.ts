import { EnokiClient } from '@mysten/enoki';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toB64 } from '@mysten/sui/utils';

// Initialize Enoki client with your API key
// This should be used server-side for sponsored transactions
export const enokiClient = new EnokiClient({
    apiKey: process.env.NEXT_PUBLIC_ENOKI_API_KEY!,
});

// Initialize SUI client for mainnet
export const suiClient = new SuiClient({ 
    url: getFullnodeUrl('mainnet')
});

// Network configuration
export const ENOKI_NETWORK = 'mainnet';

/**
 * Create a sponsored transaction using Enoki
 * This should ideally be called from a server-side API route
 * to keep your API key secure
 */
export async function createSponsoredTransaction(
    sender: string,
    transactionBlock: Transaction,
    allowedTargets?: string[],
    allowedAddresses?: string[]
) {
    try {
        // Build the transaction bytes
        const txBytes = await transactionBlock.build({
            client: suiClient,
            onlyTransactionKind: true,
        });

        // Create sponsored transaction through Enoki
        const response = await enokiClient.createSponsoredTransaction({
            network: ENOKI_NETWORK,
            transactionKindBytes: toB64(txBytes),
            sender: sender,
            ...(allowedTargets && { allowedMoveCallTargets: allowedTargets }),
            ...(allowedAddresses && { allowedAddresses: allowedAddresses }),
        });

        return response;
    } catch (error) {
        console.error('Error creating sponsored transaction:', error);
        throw error;
    }
}

/**
 * Execute a sponsored transaction
 * After the user signs the sponsored transaction bytes
 */
export async function executeSponsoredTransaction(
    digest: string,
    signature: string
) {
    try {
        const result = await enokiClient.executeSponsoredTransaction({
            digest,
            signature,
        });
        
        return result;
    } catch (error) {
        console.error('Error executing sponsored transaction:', error);
        throw error;
    }
}

/**
 * Example: Create a zkLogin keypair from JWT
 * Note: This requires the Enoki API key and should be done server-side
 */
export async function createZkLoginKeypair(jwt: string) {
    try {
        const keypair = await enokiClient.createZkLoginKeypair({
            jwt,
        });
        
        return {
            address: keypair.getPublicKey().toSuiAddress(),
            publicKey: keypair.getPublicKey().toBase64(),
        };
    } catch (error) {
        console.error('Error creating zkLogin keypair:', error);
        throw error;
    }
}