import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EventProvider } from '@/context/EventContext';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
	title: 'Sui Lens',
	description: 'all Sui events in one',
	generator: 'v0.dev',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={inter.className}>
			<body>
				<ErrorBoundary>
					<Providers>
						<ErrorBoundary>
							<EventProvider>{children}</EventProvider>
						</ErrorBoundary>
					</Providers>
				</ErrorBoundary>
			</body>
		</html>
	);
}
