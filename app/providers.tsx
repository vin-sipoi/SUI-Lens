'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import '@mysten/dapp-kit/dist/index.css';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { UserProvider } from './landing/UserContext';
import { WalletConnectionManager } from '@/components/WalletConnectionManager';

// Initialize QueryClient
const queryClient = new QueryClient();

// Custom storage adapter for wallet persistence
const createWalletStorage = () => {
	if (typeof window === 'undefined') return undefined;
	
	return {
		getItem: async (key: string) => {
			try {
				return localStorage.getItem(key);
			} catch (error) {
				console.error('Error reading from localStorage:', error);
				return null;
			}
		},
		setItem: async (key: string, value: string) => {
			try {
				localStorage.setItem(key, value);
			} catch (error) {
				console.error('Error writing to localStorage:', error);
			}
		},
		removeItem: async (key: string) => {
			try {
				localStorage.removeItem(key);
			} catch (error) {
				console.error('Error removing from localStorage:', error);
			}
		},
	};
};

// Define Sui networks
const networks = {
	devnet: { url: getFullnodeUrl('devnet') },
	mainnet: { url: getFullnodeUrl('mainnet') },
	testnet: { url: getFullnodeUrl('testnet') },
};

export default function Providers({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState('system');
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

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
				<SuiClientProvider networks={networks} defaultNetwork="testnet">
					<WalletProvider 
						autoConnect={true}
						storage={createWalletStorage()}
						storageKey="sui-lens-wallet"
					>
						<WalletConnectionManager />
						{children}
					</WalletProvider>
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
