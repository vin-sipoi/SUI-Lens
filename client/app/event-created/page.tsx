'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, Copy, Share, ChevronDown, Check, Send } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FaTelegram, FaXTwitter } from 'react-icons/fa6' 
import { FaTelegramPlane } from "react-icons/fa"

interface EventSuccessPageProps {
  params: { id: string }
}

const EventSuccessPage: React.FC<EventSuccessPageProps> = ({ params }) => {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [currentQrUrl, setCurrentQrUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [poapMinted, setPoapMinted] = useState(false)
  const [minting, setMinting] = useState(false)
  const qrRef = useRef(null)

  // Generate QR code for POAP claim
  const generateQRCode = async (url: string) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
      setQrCodeDataUrl(qrUrl)
      setCurrentQrUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  // Generate POAP claim URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const poapClaimUrl = `${window.location.origin}/claim-poap/${params.id}`
      generateQRCode(poapClaimUrl)
    }
  }, [params.id])

  // Mock mint POAP function (replace with actual wallet integration)
  // Disabled POAP minting here to move it to event details page after check-in
  const handleMintPOAP = async () => {
    alert("POAP minting is disabled on this page. Please claim your POAP after check-in on the event details page.")
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
    const text: string = "Check out this event I created on Suilens!"
    
    if (platform === 'twitter') {
      const twitterUrl: string = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`
      window.open(twitterUrl, '_blank')
    } else if (platform === 'telegram') {
      const telegramUrl: string = `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(text)}`
      window.open(telegramUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen font-inter bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <Link href="/landing" className="flex items-center space-x-3 ">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Image 
                    src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
                    alt="Suilens Logo" 
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-[#020B15]">Suilens</span>
                </Link>
      
                <nav className="hidden lg:flex text-sm font-inter items-center space-x-8">
                  <Link href='/' className="text-gray-800 font-semibold "></Link>
                  {["Communities", "Discover", "Dashboard","Bounties"].map((item) => (
                    <Link
                      key={item}
                      href={`/${item.toLowerCase().replace(' ', '-')}`}
                      className="text-gray-600  font-medium transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </nav>
      
                <div className="flex text-sm items-center space-x-4">                            
                  <Link href='/create'>
                    <Button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl">
                    Create Event
                    </Button>
                  </Link>
                  
                </div>
              </div>
            </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-medium text-gray-900 mb-4">
              Your Event Is Live
            </h1>
            <p className="text-[#747474] font-normal text-2xl">
              You've successfully created your event on Suilens.<br />
              Now let's make it a success.
            </p>
          </div>

          {/* POAP Section */}
          <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border">
            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-4">
              Mint Your Event POAP
            </h2>
            
            {!poapMinted ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Create a unique POAP (Proof of Attendance Protocol) NFT for your event attendees.
                </p>
                <Button
                  onClick={handleMintPOAP}
                  disabled={minting}
                  className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 py-3 rounded-xl"
                >
                  {minting ? 'Minting...' : 'Mint POAP NFT'}
                </Button>
              </div>
            ) : (
              <div className="text-green-600">
                <Check className="w-8 h-8 mx-auto mb-2" />
                <p>POAP NFT minted successfully!</p>
              </div>
            )}
          </div>

          {/* QR Code Section for POAP Claiming */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-6">
              POAP CLAIM QR CODE
            </h2>
            
            <div className="flex justify-center mb-6">
              <div className="bg-white p-8 rounded-xl shadow-lg border">
                {qrCodeDataUrl ? (
                  <img 
                    ref={qrRef}
                    src={qrCodeDataUrl} 
                    alt="POAP Claim QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Loading QR Code...</p>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Share this QR code with attendees to claim their POAP NFTs
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap text-base justify-center gap-4 mb-8">
              <button 
                onClick={copyLink}
                className="flex items-center px-6 py-3 border text-[#566773] border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <button 
                onClick={() => shareEvent('twitter')}
                className="flex font-normal text-[#566773] items-center px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FaXTwitter className='mr-2'/>
                Share on X
              </button>
              <button 
                onClick={() => shareEvent('telegram')}
                className="flex font-normal items-center text-[#566773] px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FaTelegramPlane className='mr-2 w-6 h-6'/>      
                Share on Telegram
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadQRCode}
              disabled={!qrCodeDataUrl}
              className="flex items-center font-semibold text-base justify-center mx-auto px-8 py-4 bg-gray-100 hover:bg-gray-200 text-[#1C1C1C] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EventSuccessPage







// 'use client'

// import React, { useState, useRef, useEffect } from 'react'
// import { Download, Copy, Share, ChevronDown, Check, Send } from 'lucide-react'
// import Image from 'next/image'
// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import { FaTelegram, FaXTwitter } from 'react-icons/fa6' 
// import { FaTelegramPlane } from "react-icons/fa"
// import { useWallet } from '@mysten/wallet-kit'
// import { mintPOAP, suiClient } from '@/lib/sui-client'

// interface EventSuccessPageProps {
//   params: { id: string }
// }

// const EventSuccessPage: React.FC<EventSuccessPageProps> = ({ params }) => {
//   const [showCustomInput, setShowCustomInput] = useState(false)
//   const [customUrl, setCustomUrl] = useState('')
//   const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
//   const [currentQrUrl, setCurrentQrUrl] = useState('')
//   const [copied, setCopied] = useState(false)
//   const [poapMinted, setPoapMinted] = useState(false)
//   const [minting, setMinting] = useState(false)
//   const qrRef = useRef(null)

//   const { connected, currentAccount, signAndExecuteTransactionBlock } = useWallet()

//   // Generate QR code for POAP claim
//   const generateQRCode = async (url: string) => {
//     try {
//       const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
//       setQrCodeDataUrl(qrUrl)
//       setCurrentQrUrl(url)
//     } catch (error) {
//       console.error('Error generating QR code:', error)
//     }
//   }

//   // Generate POAP claim URL
//   useEffect(() => {
//     const poapClaimUrl = `${window.location.origin}/claim-poap/${params.id}`
//     generateQRCode(poapClaimUrl)
//   }, [params.id])

//   // Mint POAP for event creator
//   const handleMintPOAP = async () => {
//     if (!connected || !currentAccount) {
//       alert('Please connect your wallet first')
//       return
//     }

//     setMinting(true)
//     try {
//       const eventData = {
//         id: params.id,
//         name: 'Suilens Event', // This should come from your event data
//         imageUrl: qrCodeDataUrl,
//         metadata: JSON.stringify({
//           eventId: params.id,
//           createdAt: new Date().toISOString(),
//           platform: 'Suilens'
//         })
//       }

//       const txb = await mintPOAP(
//         eventData.id,
//         eventData.name,
//         eventData.imageUrl,
//         eventData.metadata,
//         currentAccount.address,
//         process.env.NEXT_PUBLIC_PACKAGE_ID! // Your deployed package ID
//       )

//       const result = await signAndExecuteTransactionBlock({
//         transactionBlock: txb,
//         options: {
//           showEffects: true,
//         },
//       })

//       console.log('POAP minted successfully:', result)
//       setPoapMinted(true)
//     } catch (error) {
//       console.error('Error minting POAP:', error)
//       alert('Failed to mint POAP. Please try again.')
//     } finally {
//       setMinting(false)
//     }
//   }

//   // Download QR code as PNG
//   const downloadQRCode = async () => {
//     if (!qrCodeDataUrl) return
    
//     try {
//       const response = await fetch(qrCodeDataUrl)
//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const link = document.createElement('a')
//       link.href = url
//       link.download = 'event-qr-code.png'
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)
//       window.URL.revokeObjectURL(url)
//     } catch (error) {
//       console.error('Error downloading QR code:', error)
//     }
//   }

//   // Copy link to clipboard
//   const copyLink = async () => {
//     try {
//       await navigator.clipboard.writeText(currentQrUrl)
//       setCopied(true)
//       setTimeout(() => setCopied(false), 2000)
//     } catch (error) {
//       console.error('Error copying to clipboard:', error)
//     }
//   }

//   // Share functionality
//   interface ShareEventParams {
//     platform: 'twitter' | 'telegram'
//   }

//   const shareEvent = async (platform: ShareEventParams['platform']): Promise<void> => {
//     const eventUrl: string = currentQrUrl
//     const text: string = "Check out this event I created on Suilens!"
    
//     if (platform === 'twitter') {
//       const twitterUrl: string = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`
//       window.open(twitterUrl, '_blank')
//     } else if (platform === 'telegram') {
//       const telegramUrl: string = `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(text)}`
//       window.open(telegramUrl, '_blank')
//     }
//   }

//   return (
//     <div className="min-h-screen font-inter bg-gray-50">
//       {/* Header */}
//       <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
//               <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
//                 <Link href="/" className="flex items-center space-x-3 ">
//                 <div className="w-10 h-10 rounded-lg flex items-center justify-center">
//                   <Image 
//                     src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
//                     alt="Suilens Logo" 
//                     width={60}
//                     height={60}
//                     className="object-contain"
//                   />
//                 </div>
//                 <span className="text-2xl font-bold text-[#020B15]">Suilens</span>
//                 </Link>
      
//                 <nav className="hidden lg:flex text-sm font-inter items-center space-x-8">
//                   <Link href='/' className="text-gray-800 font-semibold "></Link>
//                   {["Communities", "Discover", "Dashboard","Bounties"].map((item) => (
//                     <Link
//                       key={item}
//                       href={`/${item.toLowerCase().replace(' ', '-')}`}
//                       className="text-gray-600  font-medium transition-colors"
//                     >
//                       {item}
//                     </Link>
//                   ))}
//                 </nav>
      
//                 <div className="flex text-sm items-center space-x-4">                            
//                   <Link href='/create'>
//                     <Button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl">
//                     Create Event
//                     </Button>
//                   </Link>
                  
//                 </div>
//               </div>
//             </header>

//       {/* Main Content */}
//       <main className="max-w-2xl mx-auto px-4 py-16">
//         <div className="text-center">
//           <div className="mb-8">
            
//             <h1 className="text-3xl font-medium text-gray-900 mb-4">
//               Your Event Is Live
//             </h1>
//             <p className="text-[#747474] font-normal text-2xl">
//               You've successfully created your event on Suilens.<br />
//               Now let's make it a success.
//             </p>
//           </div>

//           {/* POAP Section */}
//           <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border">
//             <h2 className="text-xl font-semibold text-[#2C2C2C] mb-4">
//               Mint Your Event POAP
//             </h2>
            
//             {!poapMinted ? (
//               <div>
//                 <p className="text-gray-600 mb-4">
//                   Create a unique POAP (Proof of Attendance Protocol) NFT for your event attendees.
//                 </p>
//                 <Button
//                   onClick={handleMintPOAP}
//                   disabled={minting || !connected}
//                   className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 py-3 rounded-xl"
//                 >
//                   {minting ? 'Minting...' : 'Mint POAP NFT'}
//                 </Button>
//               </div>
//             ) : (
//               <div className="text-green-600">
//                 <Check className="w-8 h-8 mx-auto mb-2" />
//                 <p>POAP NFT minted successfully!</p>
//               </div>
//             )}
//           </div>

//           {/* QR Code Section for POAP Claiming */}
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold text-[#2C2C2C] mb-6">
//               POAP CLAIM QR CODE
//             </h2>
            
//             <div className="flex justify-center mb-6">
//               <div className="bg-white p-8 rounded-xl shadow-lg border">
//                 {qrCodeDataUrl ? (
//                   <img 
//                     ref={qrRef}
//                     src={qrCodeDataUrl} 
//                     alt="POAP Claim QR Code"
//                     className="w-48 h-48 mx-auto"
//                   />
//                 ) : (
//                   <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
//                     <p className="text-gray-500">Loading QR Code...</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <p className="text-gray-600 mb-4">
//               Share this QR code with attendees to claim their POAP NFTs
//             </p>

//             {/* Action Buttons */}
//             <div className="flex flex-wrap  text-base justify-center gap-4 mb-12">
//               <button 
//                 onClick={copyLink}
//                 className="flex items-center px-6 py-3 border text-[#566773] border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
//               >
//                 {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
//                 {copied ? 'Copied!' : 'Copy link'}
//               </button>
//               <button 
//                 onClick={() => shareEvent('twitter')}
//                 className="flex font-normal text-[#566773] items-center px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
//               >
//                 <FaXTwitter className='mr-2'/>
//                 Share on X
//               </button>
//               <button 
//                 onClick={() => shareEvent('telegram')}
//                 className="flex font-normal items-center text-[#566773] px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
//               >
//                 <FaTelegramPlane className='mr-2 w-6 h-6'/>      
//                 Share on Telegram
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

// export default EventSuccessPage