"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, DollarSign, Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ConnectButton } from "@mysten/dapp-kit"
import { useUser } from '../../context/UserContext';

interface Bounty {
  id: number
  title: string
  description: string
  author: {
    name: string
    avatar: string
  }
  reward: string
  deadline: string
  tweet:string
}

interface BountyCardProps {
  bounty: Bounty
}

const BountyCard: React.FC<BountyCardProps> = ({ bounty }) => {
  return (
    <Card className="bg-white font-inter shadow-sm border border-gray-200 rounded-3xl mb-6 w-full max-w-none">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          {/* Left Section - Main Content */}
          <div className="flex-1 flex-col w-full lg:w-auto min-w-0">
            <div className="mb-6">
              {/* Icon and Tags */}
              <div className="flex sm:flex-row sm:items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  <Image 
                    src="/Vector.png" 
                    alt="icon" 
                    width={24} 
                    height={24}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="bg-white text-[#865503] py-1 px-3 sm:px-4 text-xs sm:text-sm font-medium border border-[#865503] rounded-3xl whitespace-nowrap">
                    Dapp
                  </button>
                  <button className="bg-white text-[#04326B] py-1 px-3 sm:px-4 text-xs sm:text-sm font-medium border border-[#04326B] rounded-3xl whitespace-nowrap">
                    Development
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-medium text-[#101928] mb-4 leading-tight">
                {bounty.title}
              </h3>
            </div>
            
            {/* Description */}
            <p className="text-[#8A94A5] text-sm sm:text-base mb-6 leading-relaxed font-medium">
              {bounty.description}
            </p>
            
            {/* Deadline and Reward */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center text-xs sm:text-sm text-[#101928] font-medium">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{bounty.deadline}</span>
              </div>
              
              <div className="flex items-center text-xs sm:text-sm text-[#101928] font-medium">
                <DollarSign className="w-4 h-4 mr-2 flex-shrink-0"/>
                <span className="truncate">{bounty.reward}</span>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button className="bg-[#4DA2FF] hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto">
              Submit work
            </Button>
          </div>
          
          {/* Right Section - Tweet Content */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="border rounded-lg p-4 bg-gray-50/50">
              {/* Author Info */}
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <Image
                    src={bounty.author.avatar}
                    alt={bounty.author.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm sm:text-base font-medium text-[#101928] truncate">
                  {bounty.author.name}
                </span>
              </div>
              
              {/* Tweet Content */}
              <p className="text-[#8A94A5] text-xs sm:text-sm mb-4 leading-relaxed font-medium line-clamp-6">
                {bounty.tweet}
              </p>
              
              {/* View Bounty Link */}
              <button className="bg-[white] text-blue-400 px-4 sm:px-6 py-2 sm:py-3 rounded-3xl border border-[#4DA2FF] text-sm font-medium transition-colors w-full sm:w-auto">
                View on X
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CommunityBounties: React.FC = () => {
  const {  user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  const [bounties, setBounties] = useState<Bounty[]>([
    {
      id: 1,
      title: "Build a fully functional BTC node",
      description: "$10,000  to any dev who builds a fully functional BTC full node as an open-source Sui Move contract by May 31st. Contract’s state should be updated in a trustless form every time a new BTC block is mined + proper handling of orphaned blocks and BTC node updates will be appreciated. The top fully functional implementation will be selected by June 7th”. Good luck \n @kostascrypto ",
      author: {
        name: "Kostas Kryptos",
        avatar: "/Ellipse 3.png"
      },
      reward: "$5,000",
      deadline: "Deadline: 20th, December 2025",
      tweet:"Beginning this May, I’ll be hosting monthly X  crypto hackathons focused on a single topic that I find interesting or even crazy. T&C will follow soon, but let’s kick things off with the 1st cool challenge:“$10,000  to any dev who builds a fully functional BTC full node as an open-source Sui Move contract by May 31st. Contract’s state should be updated in a trustless form every time a new BTC block is mined + proper handling of orphaned blocks and BTC node updates will be appreciated. The top fully functional implementation will be selected by June 7th”. Good luck"
      
    },
    {
      id: 2,
      title: "Build a fully functional LTC node",
      description: "Looking to commission the building of a litecoin node that can track and manage multiple wallets and addresses. The node should be able to handle high transaction volumes and provide real-time updates on wallet balances and transaction history. It should also include features for creating new wallets, importing existing ones, and generating new addresses. The solution should be scalable and secure, with proper error handling and logging capabilities.",
      author: {
        name: "Kostas Kryptos",
        avatar: "/Ellipse 3.png"
      },
      reward: "$3,500",
      deadline: "5 days left",
      tweet:"Beginning this May, I’ll be hosting monthly X  crypto hackathons focused on a single topic that I find interesting or even crazy. T&C will follow soon, but let’s kick things off with the 1st cool challenge:“$10,000  to any dev who builds a fully functional BTC full node as an open-source Sui Move contract by May 31st. Contract’s state should be updated in a trustless form every time a new BTC block is mined + proper handling of orphaned blocks and BTC node updates will be appreciated. The top fully functional implementation will be selected by June 7th”. Good luck",
      
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/landing" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
                <Image 
                  src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
                  alt="Suilens Logo" 
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-[#020B15]">Suilens</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex text-sm font-inter items-center space-x-8">
              {["Communities", "Discover", "Dashboard","Bounties"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-600 font-medium hover:text-gray-900 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex text-sm items-center space-x-4">                                    
              <Link href='/create'>
                <Button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl">
                  Create Event
                </Button>
              </Link>
              {!user ? (
                <ConnectButton />
              ) : (
                <Link href="/profile">
                  <img
                    src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-blue-500 cursor-pointer"
                  />
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {!user ? (
                <ConnectButton />
              ) : (
                <Link href="/profile">
                  <img
                    src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-blue-500 cursor-pointer"
                  />
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-3">
                {["Communities", "Discover", "Dashboard","Bounties"].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-600 font-medium hover:text-gray-900 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <Link href='/create' onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl w-full mt-2">
                    Create Event
                  </Button>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-medium text-[#101928] mb-4 leading-tight">
            Community Bounties
          </h1>
          <p className="text-base sm:text-xl lg:text-2xl font-normal text-[#667185] max-w-2xl mx-auto">
            Earn SUI tokens by contributing to the ecosystem
          </p>
        </div>

        {/* Bounties Container */}
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            {bounties.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityBounties;