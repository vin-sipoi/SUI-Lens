import { Transaction } from '@mysten/sui/transactions';
import { EnokiFlow } from '@mysten/enoki';

/**
 * Example of how to sign and execute transactions with Enoki zkLogin wallet
 */
export async function signAndExecuteTransaction(
  enokiFlow: EnokiFlow,
  transaction: Transaction,
  suiClient: any
) {
  try {
    // Get the keypair from Enoki (this is the zkLogin wallet)
    const keypair = await enokiFlow.getKeypair({
      network: 'mainnet' as any,
    });

    // Build the transaction
    const txBytes = await transaction.build({ client: suiClient });

    // Sign the transaction with the zkLogin wallet
    const signature = await keypair.signTransaction(txBytes);

    // Execute the transaction on the blockchain
    const result = await suiClient.executeTransactionBlock({
      transactionBlock: txBytes,
      signature: signature.signature,
    });

    console.log('Transaction successful:', result);
    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

/**
 * Example: Send SUI to another address
 */
export async function sendSUI(
  enokiFlow: EnokiFlow,
  suiClient: any,
  recipientAddress: string,
  amount: number
) {
  const tx = new Transaction();
  
  // Create a coin transfer
  const [coin] = tx.splitCoins(tx.gas, [amount]);
  tx.transferObjects([coin], recipientAddress);

  return signAndExecuteTransaction(enokiFlow, tx, suiClient);
}

/**
 * Example: Claim a POAP NFT
 */
export async function claimPOAP(
  enokiFlow: EnokiFlow,
  suiClient: any,
  poapContractAddress: string,
  eventId: string
) {
  const tx = new Transaction();
  
  // Call the claim function on the POAP contract
  tx.moveCall({
    target: `${poapContractAddress}::poap::claim`,
    arguments: [
      tx.pure.string(eventId),
    ],
  });

  return signAndExecuteTransaction(enokiFlow, tx, suiClient);
}

/**
 * Example: Interact with any smart contract
 */
export async function callSmartContract(
  enokiFlow: EnokiFlow,
  suiClient: any,
  target: string, // e.g., "0x123::module::function"
  args: any[] = []
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target,
    arguments: args,
  });

  return signAndExecuteTransaction(enokiFlow, tx, suiClient);
}