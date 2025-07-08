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

import { BountyProvider } from '../context/BountyContext';
import { UserProvider } from '../app/landing/UserContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <BountyProvider>
            {children}
          </BountyProvider>
        </UserProvider>
      </body>
    </html>
  )
}
