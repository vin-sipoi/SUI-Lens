"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Shield, CheckCircle } from "lucide-react"

export default function VerifyPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [language, setLanguage] = useState("english")

  const handleBeginVerification = () => {
    setIsVerifying(true)
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false)
      setIsVerified(true)
    }, 2000)
  }

  const handleContinue = () => {
    // Redirect to dashboard or next step
    window.location.href = "/dashboard"
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Success State */}
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-gray-900">Verification Complete</h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-sm mx-auto">
                Great! You've successfully completed the security check. Welcome to Suilens.
              </p>
            </div>

            <Button
              onClick={handleContinue}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Language Selector */}
          <div className="pt-8">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 mx-auto bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Español</SelectItem>
                <SelectItem value="french">Français</SelectItem>
                <SelectItem value="german">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-orange-500">
            Let's confirm you are
            <br />
            human
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed max-w-sm mx-auto">
            Complete the security check before continuing. This step verifies that you are not a bot, which helps to
            protect your account and prevent spam.
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-6">
          <Button
            onClick={handleBeginVerification}
            disabled={isVerifying}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors disabled:opacity-50"
          >
            {isVerifying ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              <>
                Begin
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Language Selector */}
        <div className="pt-8">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32 mx-auto bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="spanish">Español</SelectItem>
              <SelectItem value="french">Français</SelectItem>
              <SelectItem value="german">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Security Info */}
        <div className="pt-8 flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Secured by Suilens</span>
        </div>
      </div>
    </div>
  )
}
