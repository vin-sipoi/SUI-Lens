"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Wallet, Mail, Lock, Eye, EyeOff, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { ConnectButton } from "@mysten/dapp-kit"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleWalletConnect = () => {
    console.log("Connecting wallet...")
  }

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Signing in with email:", email)
  }

  return (
    <div className="min-h-screen" style={{ background: "#201a28" }}>
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1 w-32 h-32 top-20 left-10 animate-float-elegant"></div>
        <div
          className="floating-orb floating-orb-2 w-24 h-24 top-40 right-20 animate-float-elegant"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="floating-orb floating-orb-3 w-40 h-40 bottom-40 left-20 animate-float-elegant"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="floating-orb floating-orb-4 w-28 h-28 bottom-20 right-10 animate-float-elegant"
          style={{ animationDelay: "6s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 glass-dark">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 suilens-gradient-blue rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-3xl font-bold gradient-text">Suilens</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/discover" className="text-white/70 hover:text-white transition-colors">
              Discover Events
            </Link>
           <ConnectButton className="base-button-secondary"/>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-md relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 glass-dark rounded-full px-6 py-3 mb-6 shadow-xl">
            <Sparkles className="w-5 h-5 text-blue-400 animate-sparkle" />
            <span className="text-blue-300 font-semibold">Welcome Back</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Sign In</h1>
          <p className="text-white/70 text-lg">Continue on your Web3 event journey</p>
        </div>

        <Card className="base-card-light shadow-2xl">
          <CardHeader className="text-center pb-6">
            
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wallet Connect */}

            

            {/* Email Sign In */}
            <form onSubmit={handleEmailSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-12 py-3 text-lg rounded-xl border-2 focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Sign In to Suilens
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 gap-4">
          <div className="glass-dark rounded-2xl p-6 text-center">
            <div className="w-12 h-12 suilens-gradient-blue rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Secure & Private</h3>
            <p className="text-white/70 text-sm">Your data is protected with enterprise-grade security</p>
          </div>
        </div>
      </div>
    </div>
  )
}
