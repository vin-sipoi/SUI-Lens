'use client';

import { useCurrentAccount, useConnectWallet } from '@mysten/dapp-kit';
import { suiClient } from '../lib/sui-client';
import { useSignTransaction } from '@mysten/dapp-kit';
import { useZkLogin, useZkLoginSession, useEnokiFlow } from '@mysten/enoki/react';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { getEnokiNetwork } from '@/lib/network-config';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? 
  (process.env.NEXT_PUBLIC_BACKEND_URL.startsWith('http') ? 
    process.env.NEXT_PUBLIC_BACKEND_URL : 
    `http://${process.env.NEXT_PUBLIC_BACKEND_URL}`) : 
  'http://localhost:3009';

export function useSponsoredTransactionV2() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const { mutateAsync: connectWallet } = useConnectWallet();
  const { address: enokiAddress } = useZkLogin();
  const zkLoginSession = useZkLoginSession();
  const enokiFlow = useEnokiFlow();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  async function sponsorAndExecute({
    tx,
    allowedMoveCallTargets,
    allowedAddresses,
    network = 'mainnet'
  }: {
    tx: Transaction;
    allowedMoveCallTargets?: string[];
    allowedAddresses?: string[];
    network?: string;
  }) {
    console.log('🚀 Starting sponsored transaction...');
    console.log('📋 Connection Status:');
    console.log('   • Enoki address:', enokiAddress || '❌ Not available');
    console.log('   • Current account:', currentAccount ? `✅ ${currentAccount.address}` : '❌ Not connected');
    console.log('   • zkLogin session:', zkLoginSession ? '✅ Active' : '❌ Not active');
    console.log('   • User isEnoki:', user?.isEnoki ? '✅ Yes' : '❌ No');

    // Determine the sender address
    let senderAddress: string;
    
    if (user?.isEnoki && enokiAddress) {
      // Use Enoki address if user is marked as Enoki and has an address
      senderAddress = enokiAddress;
      console.log('Using Enoki address as sender:', senderAddress);
    } else if (currentAccount?.address) {
      // Use traditional wallet address
      senderAddress = currentAccount.address;
      console.log('Using traditional wallet address as sender:', senderAddress);
    } else if (user?.walletAddress) {
      // Use stored wallet address from user context
      senderAddress = user.walletAddress;
      console.log('Using stored wallet address as sender:', senderAddress);
    } else {
      // No sender address available
      const error = new Error('No sender address available. Please connect your wallet or log in with Enoki.');
      console.error('Sender address error:', error.message);
      toast.error(error.message);
      throw error;
    }

    setIsLoading(true);

    try {
      // 1. Build transaction bytes with Sui client
      const txBytes = await tx.build({
        onlyTransactionKind: true,
        client: suiClient,
      });
      
      console.log('Transaction bytes built successfully:', txBytes);
      console.log('Transaction bytes length:', txBytes.length);

      // 2. Request sponsorship from backend
      const sponsorResponse = await fetch(
        `${BACKEND_URL}/api/sponsor/sponsor-transaction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionKindBytes: toBase64(txBytes),
            sender: senderAddress,
            network,
            ...(allowedMoveCallTargets && { allowedMoveCallTargets }),
            allowedAddresses: allowedAddresses || [senderAddress],
          }),
        }
      );

      if (!sponsorResponse.ok) {
        const error = await sponsorResponse.json();
        throw new Error(`Sponsorship failed: ${error.error || error.message}`);
      }

      const { bytes, digest } = await sponsorResponse.json();

      // 3. Sign with user's key - handle both traditional and zkLogin wallets
      let signature;
      
      if (user?.isEnoki && zkLoginSession) {
        // For zkLogin users with active session
        console.log('Signing with zkLogin (Enoki)');
        try {
          const keypair = await enokiFlow.getKeypair({
            network: getEnokiNetwork(),
          });
          
          const signatureResult = await keypair.signTransaction(bytes);
          signature = signatureResult.signature;
        } catch (error: any) {
          console.error('zkLogin signing failed:', error);
          throw new Error(`zkLogin signing failed: ${error.message}`);
        }
      } else if (currentAccount) {
        // For traditional wallets
        console.log('Signing with traditional wallet');
        const signResult = await signTransaction({ transaction: bytes });
        signature = signResult.signature;
      } else {
        throw new Error('No signing method available. Please connect your wallet.');
      }
      
      if (!signature) {
        throw new Error('Error signing transaction');
      }

      // 4. Execute the transaction via backend
      const executeResponse = await fetch(
        `${BACKEND_URL}/api/sponsor/execute-transaction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ digest, signature }),
        }
      );

      if (!executeResponse.ok) {
        const error = await executeResponse.json();
        throw new Error(`Execution failed: ${error.error || error.message}`);
      }

      const result = await executeResponse.json();
      toast.success('Transaction executed successfully!');
      return result;
    } catch (error) {
      console.error('Sponsored transaction failed:', error);
      if (error instanceof Error) {
        toast.error(`Transaction failed: ${error.message}`);
      } else {
        toast.error('Transaction failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    sponsorAndExecute,
    isLoading,
    isConnected: !!zkLoginSession || !!currentAccount || !!user?.walletAddress,
    address: enokiAddress || currentAccount?.address || user?.walletAddress,
    currentAccount,
    hasZkLoginSession: !!zkLoginSession,
  };
}
