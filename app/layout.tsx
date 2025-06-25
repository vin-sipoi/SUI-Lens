import type { Metadata } from 'next'
import './globals.css'
//import WalletProviderWrapper from '@/components/WalletProvider'
import { Inter } from 'next/font/google'
import Providers from "./providers"
import { EventProvider } from '@/context/EventContext'

const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Sui Lens',
  description: 'all Sui events in one',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <EventProvider>
          <Providers>{children}</Providers>
        </EventProvider>     
      </body>
    </html>
  )
}
