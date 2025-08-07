'use client';

import { ReactNode, useEffect } from 'react';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerEnokiWallets, isEnokiNetwork } from '@mysten/enoki';

const queryClient = new QueryClient();

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

interface EnokiProviderProps {
    children: ReactNode;
}

export function EnokiProvider({ children }: EnokiProviderProps) {
    // Network configuration
    const network = 'mainnet' as const;
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    const ENOKI_API_KEY = process.env.NEXT_PUBLIC_ENOKI_API_KEY!;

    useEffect(() => {
        if (!isBrowser) return;

        // Check if the network supports Enoki
        if (!isEnokiNetwork(network)) {
            console.warn(`Network ${network} does not support Enoki wallets`);
            return;
        }

        // Register Enoki wallets
        const cleanup = registerEnokiWallets({
            apiKey: ENOKI_API_KEY,
            network,
            providers: {
                google: {
                    clientId: GOOGLE_CLIENT_ID,
                },
            },
        });

        // Cleanup function to unregister wallets
        return cleanup;
    }, [network]);

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider 
                networks={{ [network]: getFullnodeUrl(network) }} 
                defaultNetwork={network}
            >
                <WalletProvider autoConnect={true}>
                    {children}
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
}