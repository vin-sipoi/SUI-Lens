'use client';

import { SuiClientProvider, WalletProvider, useSuiClientContext } from '@mysten/dapp-kit';
import '@mysten/dapp-kit/dist/index.css';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isEnokiNetwork, registerEnokiWallets } from '@mysten/enoki';
import { EnokiFlowProvider } from '@mysten/enoki/react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { UserProvider } from '../context/UserContext';
import { ZkLoginProvider } from '../context/EnokiZkLogin';

// Initialize QueryClient
const queryClient = new QueryClient();

// Define Sui networks
const networks = {
	devnet: { url: getFullnodeUrl('devnet') },
	mainnet: { url: getFullnodeUrl('mainnet') },
	testnet: { url: getFullnodeUrl('testnet') },
};

// Component to register Enoki wallets
function RegisterEnokiWallets() {
	const { client, network } = useSuiClientContext();

	useEffect(() => {
		if (!isEnokiNetwork(network)) return;

		const { unregister } = registerEnokiWallets({
			apiKey: process.env.NEXT_PUBLIC_ENOKI_API_KEY!,
			providers: {
				google: {
					clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
				},
			},
			client,
			network,
		});

		return unregister;
	}, [client, network]);

	return null;
}

export default function Providers({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState('system');

	useEffect(() => {
		const body = window.document.body;

		const initialTheme = localStorage.getItem('suilens-theme') || 'system';
		setTheme(initialTheme);

		const applyTheme = (themeValue: string) => {
         
			if (themeValue === 'light') {
				body.classList.add('theme-light');
				body.classList.remove('theme-dark');
			} else if (themeValue === 'dark') {
				body.classList.add('theme-dark');
				body.classList.remove('theme-light');
			} else {
				// system
				body.classList.remove('theme-light');
				body.classList.remove('theme-dark');
			}
		};

		applyTheme(initialTheme);

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			if (theme === 'system') {
				if (e.matches) {
					body.classList.add('theme-dark');
					body.classList.remove('theme-light');
				} else {
					body.classList.add('theme-light');
					body.classList.remove('theme-dark');
				}
			}
		};

		mediaQuery.addEventListener('change', handleChange);

		return () => {
			mediaQuery.removeEventListener('change', handleChange);
		};
	}, [theme]);

	return (
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networks} defaultNetwork="mainnet">
				<EnokiFlowProvider
					apiKey={process.env.NEXT_PUBLIC_ENOKI_API_KEY!}
				>
					<RegisterEnokiWallets />
					<WalletProvider autoConnect={true}>
						<ZkLoginProvider>
							<UserProvider>
								{children}
							</UserProvider>
						</ZkLoginProvider>
					</WalletProvider>
				</EnokiFlowProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	);
}
