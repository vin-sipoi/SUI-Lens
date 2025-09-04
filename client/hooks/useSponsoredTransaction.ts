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
    network = 'mainnet',
    skipOnlyTransactionKind = false
  }: {
    tx: Transaction;
    allowedMoveCallTargets?: string[];
    allowedAddresses?: string[];
    network?: string;
    skipOnlyTransactionKind?: boolean;
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

    // Check if currentAccount has gas coins
    const hasGasCoins = currentAccount && currentAccount.address ? true : false;

    // For sponsored transactions with Enoki, we don't need to check for gas coins
    // The sponsor will pay for the transaction
    console.log('Gas coins check:', hasGasCoins);
    console.log('This is a sponsored transaction with Enoki, so gas coins are not required from the user');

    // Additional check for wallet connection before proceeding with the transaction
    if (!hasWalletConnection) {
      console.error('❌ No wallet connection detected - cannot proceed with transaction');
      toast.error('Wallet connection required. Please connect your wallet to continue.');
      throw new Error('Wallet connection required.');
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
        // For sponsored transactions, build as transaction kind first (no gas requirements)
        console.log('Building transaction as transaction kind (sponsored transaction)');
        txBytes = await tx.build({
          onlyTransactionKind: true,
          client: suiClient,
        });
        console.log('Transaction built successfully as transaction kind');
      } catch (buildError: any) {
        console.log('Building with onlyTransactionKind failed:', buildError.message);

        // If onlyTransactionKind fails, try building with sender set (for complex transactions)
        if (buildError.message.includes('borrow_child_object_mut') ||
            buildError.message.includes('dynamic_field') ||
            buildError.message.includes('Object not found')) {
          console.log('Dynamic field error detected, trying with sender set...');
          tx.setSender(senderAddress);
          txBytes = await tx.build({
            client: suiClient,
          });
          console.log('Transaction built successfully with sender');
        } else {
          throw new Error(`Failed to build transaction: ${buildError.message}`);
        }
      }

      console.log('Transaction bytes built successfully:', txBytes);
      console.log('Transaction bytes length:', txBytes.length);
      console.log('Transaction bytes type:', typeof txBytes);

      // Convert to base64 for inspection
      const { toBase64 } = await import('@mysten/sui/utils');
      const txBytesBase64 = toBase64(txBytes);
      console.log('Transaction bytes (base64):', txBytesBase64.substring(0, 100) + '...');

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
        
        // Handle specific error cases
        if (errorResponse.error === 'Enoki not configured') {
          throw new Error('Sponsored transactions are not properly configured. Please contact the site administrator.');
        }
        
        throw new Error(`Sponsorship failed: ${errorResponse.error || errorResponse.message || 'Unknown error'}`);
      }

      const sponsorData = await sponsorResponse.json();
      const { bytes: sponsorBytes, digest, requiresProfileCreation, profileTransaction } = sponsorData;

      console.log('🔍 Sponsor response bytes type:', typeof sponsorBytes);
      console.log('🔍 Sponsor response bytes value:', sponsorBytes);
      console.log('🔍 Requires profile creation:', requiresProfileCreation);

      // Handle profile creation case
      if (requiresProfileCreation && profileTransaction) {
        console.log('🔄 Profile creation required - returning profile transaction data');
        return {
          success: true,
          requiresProfileCreation: true,
          profileTransaction: {
            bytes: profileTransaction.bytes,
            digest: profileTransaction.digest,
          },
          mainTransaction: {
            bytes: null,
            digest: null,
          },
          network: sponsorData.network,
          message: sponsorData.message,
        };
      }

      // Handle normal transaction case
      // Defensive check: if bytes is undefined or null, throw error
      if (!sponsorBytes) {
        console.error('No bytes received in sponsor response');
        throw new Error('No transaction bytes received from sponsor. This may indicate a backend configuration issue.');
      }

      // Convert bytes to Uint8Array if it's a string (base64 encoded)
      let transactionBytes: Uint8Array;

      if (typeof sponsorBytes === 'string' && sponsorBytes.length > 0) {
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
      console.log('About to make execute-transaction request to:', `${BACKEND_URL}/api/sponsor/execute-transaction`);
      console.log('Execute request body:', { digest, signature });

      const executeResponse = await fetch(
        `${BACKEND_URL}/api/sponsor/execute-transaction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ digest, signature }),
        }
      );

      console.log('Execute response received:');
      console.log('Execute response status:', executeResponse.status);
      console.log('Execute response statusText:', executeResponse.statusText);
      console.log('Execute response ok:', executeResponse.ok);
      console.log('Execute response headers:', Object.fromEntries(executeResponse.headers.entries()));

      if (!executeResponse.ok) {
        let error;
        try {
          const responseText = await executeResponse.text();
          console.error('Execute response status:', executeResponse.status);
          console.error('Execute response status text:', executeResponse.statusText);
          console.error('Execute response text:', responseText);
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

      // Debug the response before parsing
      const responseText = await executeResponse.text();
      console.log('Execute response text:', responseText);
      console.log('Execute response text length:', responseText.length);

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Parsed execute result:', result);
        console.log('Result type:', typeof result);
        console.log('Result keys:', Object.keys(result));
      } catch (parseError) {
        console.error('Failed to parse execute response as JSON:', parseError);
        console.error('Response text that failed to parse:', responseText);
        throw new Error('Failed to parse execution response as JSON');
      }

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
