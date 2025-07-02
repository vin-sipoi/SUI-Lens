'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import '@mysten/dapp-kit/dist/index.css';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { UserProvider } from './landing/UserContext';

// Initialize QueryClient
const queryClient = new QueryClient();

// Define Sui networks
const networks = {
	devnet: { url: getFullnodeUrl('devnet') },
	mainnet: { url: getFullnodeUrl('mainnet') },
	testnet: { url: getFullnodeUrl('testnet') },
};

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

	// Wrap SUI components with try/catch to prevent errors from breaking the app
	const renderSuiComponents = () => {
		try {
			return (
				<SuiClientProvider networks={networks} defaultNetwork="devnet">
					<WalletProvider>{children}</WalletProvider>
				</SuiClientProvider>
			);
		} catch (error) {
			console.error('Error in Sui wallet components:', error);
			// Return children without wallet functionality if there's an error
			return children;
		}
	};

	return (
		<UserProvider>
			<QueryClientProvider client={queryClient}>
				{renderSuiComponents()}
			</QueryClientProvider>
		</UserProvider>
	);
}
