import type { Metadata } from 'next'
import './globals.css'
//import WalletProviderWrapper from '@/components/WalletProvider'
import Providers from "./providers"
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
    <html lang="en">
      <body>
       <Providers>{children}</Providers>
           
       
       
      </body>
    </html>
  )
}
