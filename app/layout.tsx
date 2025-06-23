import type { Metadata } from 'next'
import './globals.css'
import WalletProviderWrapper from '@/components/WalletProvider'
import { UserProvider } from "@/app/landing/UserContext"
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
      <body>
        <WalletProviderWrapper>
           <UserProvider>
              {children}
           </UserProvider>
           
        </WalletProviderWrapper>
       
      </body>
    </html>
  )
}
