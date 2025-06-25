'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, Copy, Share, ChevronDown, Check } from 'lucide-react'

const EventSuccessPage = () => {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [currentQrUrl, setCurrentQrUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const qrRef = useRef(null)

  // Simple QR code generator using a public API
  const generateQRCode = async (url: string) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
      setQrCodeDataUrl(qrUrl)
      setCurrentQrUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  // Generate default QR code on component mount
  useEffect(() => {
    generateQRCode('https://my.slush.app/')
  }, [])

  // Generate QR code with custom URL
  const generateCustomQR = () => {
    if (customUrl.trim()) {
      // Add https:// if no protocol is specified
      const url = customUrl.startsWith('http') ? customUrl : `https://${customUrl}`
      generateQRCode(url)
    } else {
      generateQRCode('https://my.slush.app/')
    }
  }

  // Download QR code as PNG
  const downloadQRCode = async () => {
    if (!qrCodeDataUrl) return
    
    try {
      const response = await fetch(qrCodeDataUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'event-qr-code.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentQrUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  // Share functionality
  interface ShareEventParams {
    platform: 'twitter' | 'telegram'
  }

  const shareEvent = async (platform: ShareEventParams['platform']): Promise<void> => {
    const eventUrl: string = currentQrUrl
    const text: string = "Check out this event I created on Sultans!"
    
    if (platform === 'twitter') {
      const twitterUrl: string = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`
      window.open(twitterUrl, '_blank')
    } else if (platform === 'telegram') {
      const telegramUrl: string = `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(text)}`
      window.open(telegramUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">Sultans</div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Home</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Communities</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Events</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Bonuses</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Create Event
              </button>
              <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Event Is Live!
            </h1>
            <p className="text-gray-600 text-lg">
              You've successfully created your event on Sultans.<br />
              Now let's make it a success.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              onClick={copyLink}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button 
              onClick={() => shareEvent('twitter')}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share className="w-4 h-4 mr-2" />
              Share on X
            </button>
            <button 
              onClick={() => shareEvent('telegram')}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share className="w-4 h-4 mr-2" />
              Share on Telegram
            </button>
          </div>

          {/* QR Code Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Save Your QR Code
            </h2>
            
            {/* Custom QR Generator */}
            <div className="mb-8">
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="flex items-center justify-center mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
              >
                Generate Custom QR Code
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${showCustomInput ? 'rotate-180' : ''}`} />
              </button>
              
              {showCustomInput && (
                <div className="max-w-md mx-auto animate-in slide-in-from-top duration-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="Enter custom URL (e.g., example.com)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && generateCustomQR()}
                    />
                    <button
                      onClick={generateCustomQR}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Display */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-8 rounded-xl shadow-lg border">
                {qrCodeDataUrl ? (
                  <img 
                    ref={qrRef}
                    src={qrCodeDataUrl} 
                    alt="Event QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Loading QR Code...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current QR URL Display */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2 font-medium">Current QR Code URL:</p>
              <p className="text-sm bg-gray-100 p-3 rounded-lg break-all font-mono text-gray-800">
                {currentQrUrl}
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadQRCode}
              disabled={!qrCodeDataUrl}
              className="flex items-center justify-center mx-auto px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5 mr-2" />
              Download QR Code
            </button>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
            <p className="text-green-800 font-medium">
              🎉 Your event is now live and ready to share!
            </p>
            <p className="text-green-600 text-sm mt-1">
              People can scan the QR code or use the link to access your event.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EventSuccessPage