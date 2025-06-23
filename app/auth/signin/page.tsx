"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
<<<<<<< HEAD
import { Wallet, Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleWalletConnect = () => {
    // Redirect to verification page first
    window.location.href = "/auth/verify"
  }

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect to verification page first
    window.location.href = "/auth/verify"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">Suilens</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/discover" className="text-gray-600 hover:text-gray-900 transition-colors">
              Discover Events
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Create Account
              </Button>
            </Link>
=======
import { Mail, Key, Sparkles, Shield } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Request OTP from backend
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch('http://localhost:3010/api/auth/request-otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok) {
        setIsOtpSent(true)
      } else {
        setError(data.error || "Failed to send OTP")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP with backend
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch('http://localhost:3010/api/auth/verify-otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send session cookie
        body: JSON.stringify({ email, otp }),
      })
      const data = await response.json()
      if (response.ok) {
        // Redirect to dashboard or home page after successful login
        window.location.href = "/dashboard"
      } else {
        setError(data.error || "Invalid or expired OTP")
      }
    } catch (err) {
      setError("Failed to verify OTP")
    } finally {
      setIsLoading(false)
    }
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
>>>>>>> deaea26 (Added backend)
          </div>
        </div>
      </header>

<<<<<<< HEAD
      <div className="container mx-auto px-4 py-16 max-w-md">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h1>
          <p className="text-gray-600 text-lg">Sign in to continue your Web3 event journey</p>
        </div>

        <Card className="bg-white shadow-lg border-gray-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wallet Connect */}
            <div className="space-y-4">
              <Button
                onClick={handleWalletConnect}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Wallet className="w-6 h-6" />
                  <span>Connect Sui Wallet</span>
                </div>
              </Button>
              <p className="text-center text-sm text-gray-500 flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                Secure & decentralized authentication
              </p>
            </div>

            <div className="relative">
              <Separator className="my-6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-gray-500 font-medium">or continue with email</span>
              </div>
            </div>

            {/* Email Sign In */}
            <form onSubmit={handleEmailSignIn} className="space-y-6">
=======
      <div className="container mx-auto px-4 py-16 max-w-md relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 glass-dark rounded-full px-6 py-3 mb-6 shadow-xl">
            <Sparkles className="w-5 h-5 text-blue-400 animate-sparkle" />
            <span className="text-blue-300 font-semibold">Welcome Back</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Sign In</h1>
          <p className="text-white/70 text-lg">Sign in with OTP to continue your Web3 event journey</p>
        </div>

        <Card className="base-card-light shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {isOtpSent ? "Enter OTP" : "Sign In with Email"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email/OTP Form */}
            <form onSubmit={isOtpSent ? handleVerifyOTP : handleRequestOTP} className="space-y-6">
>>>>>>> deaea26 (Added backend)
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
<<<<<<< HEAD
                    className="pl-10 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
=======
                    disabled={isOtpSent} // Disable email input after OTP is sent
                    className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-blue-400"
>>>>>>> deaea26 (Added backend)
                  />
                </div>
              </div>

<<<<<<< HEAD
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
                    className="pl-10 pr-12 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
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
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full py-4 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In to Suilens
                <ArrowRight className="w-5 h-5 ml-2" />
=======
              {isOtpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-700 font-semibold">
                    OTP Code
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-blue-400"
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {isLoading ? "Processing..." : isOtpSent ? "Verify OTP" : "Send OTP"}
>>>>>>> deaea26 (Added backend)
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Don't have an account?{" "}
<<<<<<< HEAD
                <Link href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-semibold">
=======
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
>>>>>>> deaea26 (Added backend)
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
<<<<<<< HEAD
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Your data is protected with enterprise-grade security</span>
=======
        <div className="mt-12 grid grid-cols-1 gap-4">
          <div className="glass-dark rounded-2xl p-6 text-center">
            <div className="w-12 h-12 suilens-gradient-blue rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Secure & Private</h3>
            <p className="text-white/70 text-sm">Your data is protected with enterprise-grade security</p>
>>>>>>> deaea26 (Added backend)
          </div>
        </div>
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> deaea26 (Added backend)
