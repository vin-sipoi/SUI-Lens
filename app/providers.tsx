"use client"

import type React from "react"

import { CacheProvider } from "@chakra-ui/next-js"
import { ChakraProvider } from "@chakra-ui/react"
import { WalletProvider } from "@mysten/dapp-kit"

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <CacheProvider>
      <ChakraProvider>
        <WalletProvider autoConnect={true}>{children}</WalletProvider>
      </ChakraProvider>
    </CacheProvider>
  )
}

export default Providers
