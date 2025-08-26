'use client';

import { useCurrentAccount, useConnectWallet } from '@mysten/dapp-kit';
import { useSignTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { getSession } from '@/lib/enoki-flow';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3009';

export function useSponsoredTransaction() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const { mutateAsync: connectWallet } = useConnectWallet();
  const [isLoading, setIsLoading] = useState(false);

  async function sponsorAndExecute({
    tx,
    allowedMoveCallTargets,
    allowedAddresses,
    network = 'testnet'
  }: {
    tx: Transaction;
    allowedMoveCallTargets?: string[];
    allowedAddresses?: string[];
    network?: string;
  }) {
    const session = await getSession();
    if (!session || !currentAccount) {
      toast.error('Wallet connection required. Please connect your wallet to continue.');
      return null;
    }

    setIsLoading(true);

    try {
      // 1. Build transaction bytes (without client to avoid type issues)
      const txBytes = await tx.build({
        onlyTransactionKind: true,
      });

      // 2. Request sponsorship from backend
      const sponsorResponse = await fetch(
        `${BACKEND_URL}/api/sponsor-transaction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionKindBytes: toBase64(txBytes),
            sender: currentAccount.address,
            network,
            ...(allowedMoveCallTargets && { allowedMoveCallTargets }),
            allowedAddresses: allowedAddresses || [currentAccount.address],
          }),
        }
      );

      if (!sponsorResponse.ok) {
        const error = await sponsorResponse.json();
        throw new Error(`Sponsorship failed: ${error.error || error.message}`);
      }

      const { bytes, digest } = await sponsorResponse.json();

      // 3. Sign with user's key
      const { signature } = await signTransaction({ transaction: bytes });
      if (!signature) {
        throw new Error('Error signing transaction');
      }

      // 4. Execute the transaction via backend
      const executeResponse = await fetch(
        `${BACKEND_URL}/api/execute-transaction`,
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
    isConnected: !!currentAccount,
    address: currentAccount?.address,
    currentAccount, // Expose currentAccount for additional checks
  };
}
