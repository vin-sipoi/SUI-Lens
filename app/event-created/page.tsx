'use client'

import React, { useState, useRef } from 'react'
import { Download, Copy, Share, ChevronDown } from 'lucide-react'
import  QRCode  from 'qrcode'

interface EventSuccessPageProps {
  eventUrl?: string
  eventTitle?: string
}

const EventSuccessPage: React.FC<EventSuccessPageProps> = ({ 
  eventUrl = 'https://sultans.com/event/12345',
  eventTitle = 'My Event'
}) => {
  
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const qrRef = useRef<HTMLDivElement>(null)
  const [src,setSrc] = useState<string>('')

  // Generate QR code with custom URL
  const generateCustomQR = () => {
    QRCode.toDataURL("https://my.slush.app/").then(setSrc)
  }

  // Download QR code as PNG
  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    img.onload = () => {
      canvas.width = 300
      canvas.height = 300
      ctx?.drawImage(img, 0, 0, 300, 300)
      
      // Download the image
      const link = document.createElement('a')
      link.download = `${eventTitle}-qr-code.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  }

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(src)
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Share functionality
  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: `Check out this event: ${eventTitle}`,
          url: src,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback to copying
      copyLink()
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
              <a href="#" className="text-gray-500 hover:text-gray-700">Home</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Communities</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Events</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Bonuses</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Event Is Live
          </h1>
          <p className="text-gray-600 mb-8">
            You've successfully created your event on Sultans.<br />
            Now let's make it a success.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              onClick={copyLink}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy link
            </button>
            <button 
              onClick={shareEvent}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Share className="w-4 h-4 mr-2" />
              Share on X
            </button>
            <button 
              onClick={shareEvent}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Share className="w-4 h-4 mr-2" />
              Share on telegram
            </button>
          </div>

          {/* QR Code Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              SAVE YOUR QR CODE
            </h2>
            
            {/* Custom QR Generator */}
            <div className="mb-6">
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
              >
                Generate Custom QR Code
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showCustomInput ? 'rotate-180' : ''}`} />
              </button>
              
              {showCustomInput && (
                <div className="max-w-md mx-auto">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="Enter custom URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={generateCustomQR}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Display */}
            <div 
              ref={qrRef}
              className="flex justify-center mb-6"
            >
              <div className="bg-white p-6 rounded-lg shadow-lg">
                {/* QR Code */}
                <img src={src} alt='' />
              </div>
            </div>

            {/* Current QR URL Display */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current QR Code URL:</p>
              <p className="text-sm bg-gray-100 p-2 rounded break-all">{src}</p>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadQRCode}
              className="flex items-center justify-center mx-auto px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EventSuccessPage