import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EventProvider } from '@/context/EventContext';
import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'sonner';

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
		<html lang="en">
			<body className='font-sans antialiased'>
				<ErrorBoundary>
					<Providers>
						<ErrorBoundary>
							<EventProvider>
								{children}
								<Toaster 
									position="bottom-right"
									richColors
									closeButton
									duration={5000}
								/>
							</EventProvider>
						</ErrorBoundary>
					</Providers>
				</ErrorBoundary>
			</body>
		</html>
	);
}
