'use client';

import { useCurrentAccount, useConnectWallet } from '@mysten/dapp-kit';
import { suiClient } from '../lib/sui-client'; // Import the Sui client
import { useSignTransaction } from '@mysten/dapp-kit';
import { useZkLogin, useZkLoginSession, useEnokiFlow } from '@mysten/enoki/react';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext'; // Import UserContext
import { getEnokiNetwork } from '@/lib/network-config'; // Import network config

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? 
  (process.env.NEXT_PUBLIC_BACKEND_URL.startsWith('http') ? 
    process.env.NEXT_PUBLIC_BACKEND_URL : 
    `http://${process.env.NEXT_PUBLIC_BACKEND_URL}`) : 
  'http://localhost:3009';

export function useSponsoredTransaction() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const { mutateAsync: connectWallet } = useConnectWallet();
  const { address: enokiAddress } = useZkLogin();
  const zkLoginSession = useZkLoginSession();
  const enokiFlow = useEnokiFlow();
  const { user } = useUser(); // Add UserContext to check for stored wallet addresses
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
    console.log('   • isConnected (hook):', !!zkLoginSession || !!currentAccount);
    console.log('   • BACKEND_URL:', BACKEND_URL);
    
    // Detailed debug information
    console.log('🔍 Detailed Debug Info:');
    console.log('   • zkLoginSession object:', zkLoginSession);
    console.log('   • currentAccount object:', currentAccount);
    console.log('   • enokiAddress:', enokiAddress);
    
    if (!zkLoginSession) {
        console.warn('⚠️ Warning: zkLogin session is not active. Ensure you are logged in with Enoki.');
    }
    if (!currentAccount) {
        console.warn('⚠️ Warning: Current account is not connected. Please connect your wallet.');
    }
    
    // For Enoki users, we can use the enokiAddress from useZkLogin()
    // For traditional wallets, we need currentAccount
    // Also check UserContext for stored wallet addresses (for Enoki users)
    const senderAddress = enokiAddress || currentAccount?.address || user?.walletAddress;
    
    // Check if we have any form of wallet connection
    const hasWalletConnection = zkLoginSession || currentAccount || user?.walletAddress;
    
    if (!hasWalletConnection) {
      console.log('❌ No wallet connection detected - cannot proceed with transaction');
      
      let errorMessage = 'Wallet connection required. ';
      
      // Check if we might have a session issue
      const hasLocalStorageSession = typeof window !== 'undefined' && 
        localStorage.getItem('enoki-session');
      
      if (hasLocalStorageSession) {
        errorMessage += 'It appears you have a stored session but it may have expired. ';
        errorMessage += 'Please try logging out and back in with Enoki, or connect your wallet manually.';
      } else {
        errorMessage += 'Please connect your wallet to continue. ';
        errorMessage += 'If you signed up with Enoki, ensure you are properly logged in. ';
        errorMessage += 'Make sure your wallet is connected and you are logged in with Enoki.';
      }
      
      console.error('Connection state details:', JSON.stringify({
        zkLoginSession: zkLoginSession,
        currentAccount: currentAccount,
        enokiAddress: enokiAddress,
        userWalletAddress: user?.walletAddress,
        hasLocalStorageSession: hasLocalStorageSession
      }, null, 2));
      
      const error = new Error(errorMessage);
      toast.error(error.message);
      throw error;
    }

    // Additional check for wallet connection before proceeding with the transaction
    if (!currentAccount && !user?.walletAddress) {
      console.error('❌ No current account or stored wallet address found. Please connect your wallet.');
      throw new Error('No wallet connection found. Please connect your wallet to proceed with transactions.');
    }
    
    if (!senderAddress) {
      // Check if we have a zkLogin session but no address - this might indicate an Enoki session issue
      if (zkLoginSession && !enokiAddress) {
        const error = new Error('Enoki session exists but no address found. Please try logging out and back in.');
        console.error('Enoki session issue:', error.message);
        toast.error(error.message);
        throw error;
      }
      
      const error = new Error('No sender address available. Please ensure your wallet is properly connected. Check if your Enoki session has a valid address.');
      console.error('Sender address error:', error.message);
      toast.error(error.message);
      throw error;
    }

    console.log('Using sender address:', senderAddress);

    setIsLoading(true);

    try {
      // Check if the transaction is for creating a profile and if the user already has one
      // This is a simple check - in a real implementation, you'd need to analyze the transaction
      // to determine if it's a profile creation transaction
      console.log('Checking if user already has a profile...');
      
      // For now, we'll add a basic check that can be enhanced later
      // This is a placeholder for more sophisticated transaction analysis
      const isProfileCreationTx = true; // Assume it's a profile creation for now
      
      if (isProfileCreationTx) {
        try {
          const profileCheckResponse = await fetch(`${BACKEND_URL}/api/user/profile-exists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: senderAddress }),
          });
          
          if (profileCheckResponse.ok) {
            const profileExists = await profileCheckResponse.json();
            if (profileExists.exists) {
              throw new Error('Profile already exists. Please update your profile instead of creating a new one.');
            }
          }
        } catch (checkError) {
          console.warn('Profile check failed, proceeding with transaction:', checkError);
          // Continue with transaction if check fails
        }
      }

      // 1. Build transaction bytes with Sui client
      console.log('Building transaction with network:', network);
      console.log('Sui client network:', suiClient.network);
      
      let txBytes: Uint8Array;
      try {
        txBytes = await tx.build({
          onlyTransactionKind: true,
          client: suiClient,
        });
        
        console.log('Transaction bytes built successfully:', txBytes);
        console.log('Transaction bytes length:', txBytes.length);
        console.log('Transaction bytes type:', typeof txBytes);
        
        // Convert to base64 for inspection
        const { toBase64 } = await import('@mysten/sui/utils');
        const txBytesBase64 = toBase64(txBytes);
        console.log('Transaction bytes (base64):', txBytesBase64.substring(0, 100) + '...');
      } catch (buildError: any) {
        console.error('Transaction build failed:', buildError);
        throw new Error(`Failed to build transaction: ${buildError.message}`);
      }

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
        let errorResponse;
        try {
          const responseText = await sponsorResponse.text();
          if (responseText) {
            errorResponse = JSON.parse(responseText);
          } else {
            errorResponse = {};
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorResponse = { error: 'Unknown error occurred' };
        }
        console.error('Sponsorship error response:', errorResponse);
        throw new Error(`Sponsorship failed: ${errorResponse.error || errorResponse.message || 'Unknown error'}`);
      }

      const sponsorData = await sponsorResponse.json();
      const { bytes: sponsorBytes, digest } = sponsorData;

      console.log('🔍 Sponsor response bytes type:', typeof sponsorBytes);
      console.log('🔍 Sponsor response bytes value:', sponsorBytes);
      
      // Convert bytes to Uint8Array if it's a string (base64 encoded)
      let transactionBytes: Uint8Array;
      
      if (typeof sponsorBytes === 'string') {
        console.log('Converting base64 string to Uint8Array for signing');
        // If bytes is a base64 string, decode it to Uint8Array
        const { fromBase64 } = await import('@mysten/sui/utils');
        transactionBytes = fromBase64(sponsorBytes);
      } else if (sponsorBytes instanceof Uint8Array) {
        console.log('Bytes is already Uint8Array, using directly');
        transactionBytes = sponsorBytes;
      } else if (Array.isArray(sponsorBytes)) {
        console.log('Converting array to Uint8Array');
        transactionBytes = new Uint8Array(sponsorBytes);
      } else {
        console.error('Unknown bytes format:', typeof sponsorBytes, sponsorBytes);
        throw new Error(`Invalid bytes format received from sponsor: ${typeof sponsorBytes}`);
      }

      console.log('Final transaction bytes type:', typeof transactionBytes);
      console.log('Final transaction bytes length:', transactionBytes.length);

      // 3. Sign with user's key - handle both traditional and zkLogin wallets
      let signature;
      
      if (user?.isEnoki) {
        // For zkLogin users, use EnokiFlow to sign with the correct approach
        console.log('Signing with zkLogin (Enoki)');
        try {
          // Use the session to get the keypair
          const session = await enokiFlow.getSession();
          if (!session) {
            console.warn('No active zkLogin session found. Please log in with Enoki.');
            
            // Check if there's a stored session that might need to be restored
            const hasStoredSession = typeof window !== 'undefined' && 
              (localStorage.getItem('enoki-session') || localStorage.getItem('enoki_session'));
            
            if (hasStoredSession) {
              throw new Error('Your Enoki session appears to be expired. Please log out and log back in with Enoki.');
            } else {
              throw new Error('No active zkLogin session found. Please log in with Enoki to use sponsored transactions.');
            }
          } else {
            // Use the session to get the keypair
            const keypair = await enokiFlow.getKeypair({
              network: getEnokiNetwork(),
            });
            
            console.log('About to sign transaction with keypair...');
            const signatureResult = await keypair.signTransaction(transactionBytes);
            signature = signatureResult.signature;
            console.log('Transaction signed successfully with zkLogin');
          }
        } catch (error: any) {
          console.error('zkLogin signing failed:', error);
          throw new Error(`zkLogin signing failed: ${error.message}`);
        }
      } else {
        // For traditional wallets, use dapp-kit signTransaction
        console.log('Signing with traditional wallet');
        // Convert Uint8Array back to base64 string for dapp-kit compatibility
        const { toBase64 } = await import('@mysten/sui/utils');
        const transactionString = toBase64(transactionBytes);
        const signResult = await signTransaction({ transaction: transactionString });
        signature = signResult.signature;
        console.log('Transaction signed successfully with traditional wallet');
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
        let error;
        try {
          const responseText = await executeResponse.text();
          if (responseText) {
            error = JSON.parse(responseText);
          } else {
            error = { error: 'Unknown error occurred' };
          }
        } catch (parseError) {
          console.error('Failed to parse execution error response:', parseError);
          error = { error: 'Unknown error occurred during execution' };
        }
        throw new Error(`Execution failed: ${error.error || error.message || 'Unknown error'}`);
      }

      const result = await executeResponse.json();
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
    currentAccount, // Expose currentAccount for additional checks
  };
}
