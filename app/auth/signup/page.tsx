"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Wallet, Mail, Lock, Eye, EyeOff, Sparkles, Shield, Zap, CheckCircle, XCircle, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { ConnectButton } from "@mysten/dapp-kit"

type Step = 'registration' | 'otp-verification' | 'success'

export default function SignInPage() {
  const [currentStep, setCurrentStep] = useState<Step>('registration')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ confirmPassword: false })
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  
  // Refs for OTP inputs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  // Check if passwords match
  const passwordsMatch = password === confirmPassword && password.length > 0
  const showPasswordError = touched.confirmPassword && confirmPassword.length > 0 && !passwordsMatch
  const isFormValid = email.length > 0 && password.length > 0 && passwordsMatch
  const isOtpComplete = otp.every(digit => digit !== "")

  const handleWalletConnect = () => {
    console.log("Connecting wallet...")
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call to send OTP
      await sendOTP(email)
      setCurrentStep('otp-verification')
      setResendTimer(60) // 60 seconds cooldown
    } catch (err) {
      setError("Failed to send verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const sendOTP = async (email: string) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Sending OTP to ${email}`)
        resolve(true)
      }, 1000)
    })
  }

  const verifyOTP = async (otpCode: string) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // For demo purposes, accept "123456" as valid OTP
        if (otpCode === "123456") {
          resolve(true)
        } else {
          reject(new Error("Invalid OTP"))
        }
      }, 1000)
    })
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus next input
    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      // Focus previous input on backspace
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i]
      }
    }
    
    setOtp(newOtp)
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const otpCode = otp.join("")

    try {
      await verifyOTP(otpCode)
      setCurrentStep('success')
    } catch (err) {
      setError("Invalid verification code. Please try again.")
      setOtp(["", "", "", "", "", ""]) // Clear OTP
      otpRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    setIsLoading(true)
    try {
      await sendOTP(email)
      setResendTimer(60)
      setError(null)
    } catch (err) {
      setError("Failed to resend verification code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmPasswordBlur = () => {
    setTouched({ ...touched, confirmPassword: true })
  }

  const renderRegistrationStep = () => (
    <>
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 glass-dark rounded-full px-6 py-3 mb-6 shadow-xl">
          <Sparkles className="w-5 h-5 text-blue-400 animate-sparkle" />
          <span className="text-blue-300 font-semibold">Hi,</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Register</h1>
        <p className="text-white/70 text-lg">Start your Web3 event journey</p>
      </div>

      <Card className="base-card-light shadow-2xl">
        <CardHeader className="text-center pb-6">
         
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Wallet Connect */}
          <div className="space-y-4">
            
            
          </div>

          <div className="relative">
            
          </div>

          {/* Email Registration Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-6">
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

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-700 font-semibold">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={handleConfirmPasswordBlur}
                  required
                  className={`pl-10 pr-12 py-3 text-lg rounded-xl border-2 transition-colors ${
                    showPasswordError 
                      ? 'border-red-400 focus:border-red-400' 
                      : passwordsMatch && confirmPassword.length > 0
                      ? 'border-green-400 focus:border-green-400'
                      : 'focus:border-blue-400'
                  }`}
                />
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  {confirmPassword.length > 0 && (
                    passwordsMatch ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      touched.confirmPassword && <XCircle className="w-5 h-5 text-red-500" />
                    )
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {showPasswordError && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <XCircle className="w-4 h-4 mr-1" />
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && confirmPassword.length > 0 && (
                <p className="text-green-500 text-sm flex items-center mt-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Passwords match
                </p>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm font-semibold text-center bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-4 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-300 transform ${
                isFormValid && !isLoading
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white hover:shadow-2xl hover:-translate-y-1'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? "Sending Code..." : "Continue with Email"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">
               Log In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )

  const renderOtpStep = () => (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 glass-dark rounded-full px-6 py-3 mb-6 shadow-xl">
          <Mail className="w-5 h-5 text-blue-400" />
          <span className="text-blue-300 font-semibold">Verify Email</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Check Your Email</h1>
        <p className="text-white/70 text-lg">We sent a 6-digit code to</p>
        <p className="text-blue-300 font-semibold text-lg">{email}</p>
      </div>

      <Card className="base-card-light shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">Enter Verification Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-gray-700 font-semibold text-center block">
                6-Digit Verification Code
              </Label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-12 text-center text-xl font-bold rounded-xl border-2 focus:border-blue-400"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-semibold text-center bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!isOtpComplete || isLoading}
              className={`w-full py-4 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-300 transform ${
                isOtpComplete && !isLoading
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white hover:shadow-2xl hover:-translate-y-1'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Didn't receive the code?
            </p>
            <Button
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || isLoading}
              variant="outline"
              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
            >
              {resendTimer > 0 ? (
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Resend in {resendTimer}s
                </span>
              ) : (
                "Resend Code"
              )}
            </Button>
            <Button
              onClick={() => setCurrentStep('registration')}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )

  const renderSuccessStep = () => (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 glass-dark rounded-full px-6 py-3 mb-6 shadow-xl">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-300 font-semibold">Success!</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Welcome to Suilens</h1>
        <p className="text-white/70 text-lg">Your account has been created successfully</p>
      </div>

      <Card className="base-card-light shadow-2xl">
        <CardContent className="space-y-6 py-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Account Verified!</h2>
            <p className="text-gray-600">
              Your email <span className="font-semibold text-blue-600">{email}</span> has been verified.
            </p>
            <Button
              onClick={() => console.log("Navigate to dashboard")}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )

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
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-md relative z-10">
        {currentStep === 'registration' && renderRegistrationStep()}
        {currentStep === 'otp-verification' && renderOtpStep()}
        {currentStep === 'success' && renderSuccessStep()}

        {/* Features - Only show on registration step */}
        {currentStep === 'registration' && (
          <div className="mt-12 grid grid-cols-1 gap-4">
            <div className="glass-dark rounded-2xl p-6 text-center">
              <div className="w-12 h-12 suilens-gradient-blue rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-white mb-2">Secure & Private</h3>
              <p className="text-white/70 text-sm">Your data is protected with enterprise-grade security</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}