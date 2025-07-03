"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { FcGoogle } from "react-icons/fc"
import { FaApple, FaWallet } from "react-icons/fa"
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit"
import { useUser } from "@/app/landing/UserContext"
import { useRouter } from 'next/navigation'; 

const wallets = [
  { name: "Slush", icon: "/placeholder-logo.svg" },
  { name: "Nightly", icon: "/placeholder-logo.svg" },
  { name: "Backpack", icon: "/placeholder-logo.svg" },
  { name: "Hana Wallet", icon: "/placeholder-logo.svg" },
  { name: "OKX Wallet", icon: "/placeholder-logo.svg" },
]

export default function SignUpPage() {
  const router = useRouter()
  const { login, user } = useUser()
  const account = useCurrentAccount()
  const [loginType, setLoginType] = useState<'wallet' | 'email'>("wallet")

  const handleWalletConnect = async () => {
    console.log("handleWalletConnect started"); // Log at the beginning
    try {
      console.log("Account:", account); // Log the account object
      if (account) {
        console.log("Wallet connected:", account.address)
        console.log("Calling login function..."); // Log before login
        await login({
          name: 'Sui User',
          email: '',
          emails: [{ address: '', primary: true, verified: false }],
          avatarUrl: '/placeholder-user.jpg',
          walletAddress: account.address,
        })
        console.log("Login function completed. User:", user); // Log after login
        console.log("Attempting redirect to /landing..."); // Log before redirect
        router.push('/landing')
        console.log("Redirect function called."); // Log after redirect call
      } else {
        console.error("No wallet connected.")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("handleEmailSignup started")
    try {
      const name = document.getElementById('name') as HTMLInputElement
      const email = document.getElementById('email') as HTMLInputElement
      const password = document.getElementById('password') as HTMLInputElement

      console.log("Calling login function...")
      await login({
        name: name.value,
        email: email.value,
        emails: [{ address: email.value, primary: true, verified: false }],
        avatarUrl: '/placeholder-user.jpg',
        walletAddress: undefined,
      })
      console.log("Login function completed. User:", user)
      console.log("Attempting redirect to /landing...")
      router.push('/landing')
      console.log("Redirect function called.")
    } catch (error) {
      console.error("Error during email signup:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Left: Auth Card */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 max-w-xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-2">Get Started on Suilens</h1>
          <p className="text-gray-500">
            Login with one of your socials to start interacting with Suilens
          </p>
        </div>
        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 py-6 text-base font-medium"
          >
            <FcGoogle className="w-5 h-5" /> Sign up with Google
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 py-6 text-base font-medium"
          >
            <FaApple className="w-5 h-5" /> Sign up with Apple ID
          </Button>
        </div>
        <div className="flex gap-2 mb-6">
          <Button
            variant={loginType === 'wallet' ? 'default' : 'outline'}
            className="flex-1 py-3 text-base font-medium"
            onClick={() => setLoginType('wallet')}
          >
            <FaWallet className="inline mr-2" /> Wallet
          </Button>
          <Button
            variant={loginType === 'email' ? 'default' : 'outline'}
            className="flex-1 py-3 text-base font-medium"
            onClick={() => setLoginType('email')}
          >
            Email / Password
          </Button>
        </div>
        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-4 text-gray-400 text-sm">
            or
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        {loginType === 'wallet' ? (
          <div className="space-y-3">
            {wallets.map((wallet) =>
              wallet.name === "Slush" ? (
                <ConnectButton
                  key={wallet.name}
                  className="w-full flex items-center gap-3 py-5 text-base font-medium justify-start"
                  style={{ width: "100%" }}
                >
                  <Image
                    src={wallet.icon}
                    alt={wallet.name}
                    width={24}
                    height={24}
                    className="rounded"
                  />
                  {wallet.name}
                </ConnectButton>
              ) : (
                <Button
                  key={wallet.name}
                  variant="outline"
                  className="w-full flex items-center gap-3 py-5 text-base font-medium justify-start"
                  // Add logic for other wallets here if needed
                >
                  <Image
                    src={wallet.icon}
                    alt={wallet.name}
                    width={24}
                    height={24}
                    className="rounded"
                  />
                  {wallet.name}
                </Button>
              )
            )}
          </div>
        ) : (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" placeholder="Enter your name" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" placeholder="example@company.com" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input type="password" placeholder="Enter your password" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10" />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer">
                  {/* Add eye icon for show/hide password if needed */}
                </span>
              </div>
            </div>
            <Button type="submit" className="w-full py-3 text-base font-medium bg-[#56A8FF] hover:bg-blue-500 text-white rounded">
              Sign Up
            </Button>
          </form>
        )}
        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-[#56A8FF] hover:underline">Sign In</Link>
        </div>
      </div>
      {/* Right: Logo Section */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#56A8FF] rounded-l-3xl">
        <Image
          src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
          alt="SuiLens Logo"
          width={200}
          height={200}
        />
      </div>
    </div>
  )
}
