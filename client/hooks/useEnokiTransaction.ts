'use client';

import { useEnokiFlow, useZkLogin } from '@mysten/enoki/react';
import { useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from 'sonner';

export function useEnokiTransaction() {
  const enokiFlow = useEnokiFlow();
  const { address } = useZkLogin();
  const suiClient = useSuiClient();

  const signAndExecuteTransaction = async (transaction: Transaction) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      throw new Error('No wallet connected');
    }

    try {
      toast.loading('Preparing transaction...');

      // Set the sender
      transaction.setSender(address);

      // Get the keypair from Enoki
      const keypair = await enokiFlow.getKeypair({
        network: 'mainnet' as any,
      });

      // Build the transaction
      const txBytes = await transaction.build({ client: suiClient });

      toast.loading('Please approve the transaction...');

      // Sign the transaction
      const signature = await keypair.signTransaction(txBytes);

      toast.loading('Executing transaction...');

      // Execute the transaction
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: signature.signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      toast.success('Transaction successful!');
      console.log('Transaction result:', result);
      
      return result;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      toast.error(error.message || 'Transaction failed');
      throw error;
    }
  };

  const sendAsset = async (recipientAddress: string, amount: number) => {
    const tx = new Transaction();
    
    // Split coins and transfer
    const [coin] = tx.splitCoins(tx.gas, [amount]);
    tx.transferObjects([coin], recipientAddress);

    return signAndExecuteTransaction(tx);
  };

  const claimNFT = async (contractAddress: string, functionName: string, args: any[] = []) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${contractAddress}::${functionName}`,
      arguments: args,
    });

    return signAndExecuteTransaction(tx);
  };

  return {
    signAndExecuteTransaction,
    sendAsset,
    claimNFT,
    isConnected: !!address,
    address,
  };
}