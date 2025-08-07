'use client';

import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function EnokiTransactionExample() {
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [isLoading, setIsLoading] = useState(false);
    const [txDigest, setTxDigest] = useState<string | null>(null);

    const handleTransaction = async () => {
        if (!currentAccount) {
            alert('Please connect your wallet first');
            return;
        }

        try {
            setIsLoading(true);
            
            // Create a new transaction
            const transaction = new Transaction();
            
            // Example: Split a coin and send to recipient
            // This is just an example - replace with your actual transaction logic
            const [coin] = transaction.splitCoins(transaction.gas, [100]);
            transaction.transferObjects([coin], currentAccount.address);
            
            // Sign and execute the transaction using Enoki
            // No confirmation needed - Enoki handles it automatically
            const { digest } = await signAndExecuteTransaction({
                transaction,
            });
            
            console.log('Transaction successful:', digest);
            setTxDigest(digest);
            
        } catch (error) {
            console.error('Transaction failed:', error);
            alert('Transaction failed. See console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentAccount) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Please connect your wallet to use transactions</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Enoki Transaction Example</h3>
                <p className="text-sm text-blue-700">
                    Connected: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                </p>
            </div>

            <Button
                onClick={handleTransaction}
                disabled={isLoading}
                className="w-full"
            >
                {isLoading ? 'Processing...' : 'Execute Test Transaction'}
            </Button>

            {txDigest && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-semibold mb-1">Transaction Successful!</p>
                    <p className="text-xs text-gray-600 break-all">
                        Digest: {txDigest}
                    </p>
                </div>
            )}
        </div>
    );
}