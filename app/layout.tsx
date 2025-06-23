import type { Metadata } from 'next'
import './globals.css'
<<<<<<< HEAD
=======
import WalletProviderWrapper from '@/components/WalletProvider'
>>>>>>> deaea26 (Added backend)

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body>{children}</body>
=======
      <body>
        <WalletProviderWrapper>{children}</WalletProviderWrapper>
        </body>
>>>>>>> deaea26 (Added backend)
    </html>
  )
}
