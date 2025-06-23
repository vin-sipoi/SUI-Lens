"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConnectButton } from "@mysten/dapp-kit"
import { Search, Wallet, Award, Coins, ArrowRight, Play, Calendar } from "lucide-react"
import Link from "next/link"
import { useUser } from "./UserContext"
import { ProfileDropdown } from "./ProfileDropDown"

export default function HomePage() {
  const { user, login } = useUser()

  // For demo: fake login on click
  const handleDemoLogin = () => {
    login({
      name: "Jane Doe",
      email: "jane@example.com",
      avatarUrl: "/avatar-placeholder.png", // Put a real image in public/ if you want
    })
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
      <header className="border-b border-white/10 glass-dark sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 suilens-gradient-blue rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-glow-pulse">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-3xl font-bold gradient-text">Suilens</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {["Discover", "Bounties", "POAPs", "Help"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-white/70 hover:text-white font-medium transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-10">
            <Link
              href="/discover"
              className="hidden sm:block text-white/70 hover:text-white font-medium transition-colors"
            >
              Explore Events
            </Link>
            {!user ? (
              <>
                <Link
                  href="/auth/signup"
                  className="hidden sm:block text-white/70 hover:text-white font-medium transition-colors"
                >
                  Sign Up
                </Link>
                {/* Demo login button, remove in production */}
                <button
                  onClick={handleDemoLogin}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Demo Login
                </button>
              </>
            ) : (
              <ProfileDropdown />
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <div className="inline-flex items-center px-6 py-3 glass-dark rounded-full border border-white/20">
                <span className="text-sm font-medium text-blue-300">🚀 Powered by Sui Blockchain</span>
              </div>

              <h1 className="text-display text-white text-glow-white">
                Web3 Events
                <br />
                <span className="gradient-text">Reimagined</span>
                <br />
                on Sui
              </h1>

              <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
                Create, discover, and attend Web3 events with verifiable proof of attendance, community bounties, and
                seamless blockchain integration.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/create">
                <Button className="base-button-primary px-8 py-4 text-lg font-semibold btn-magical">
                  Create Web3 Event
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/discover">
                <Button className="base-button-secondary px-8 py-4 text-lg font-semibold">
                  <Play className="w-5 h-5 mr-2" />
                  Explore Events
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              {[
                { value: "10K+", label: "POAPs Minted", icon: Award },
                { value: "500+", label: "Web3 Events", icon: Calendar },
                { value: "50K SUI", label: "Bounties Paid", icon: Coins },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-12 h-12 glass-dark rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50/10 transition-colors border border-white/10">
                    <stat.icon className="w-6 h-6 text-white/70 group-hover:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-slide-in-right">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow-400/20 rounded-xl rotate-12 flex items-center justify-center backdrop-blur-sm border border-yellow-400/30">
                <Coins className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-green-400/30">
                <Award className="w-5 h-5 text-green-400" />
              </div>
              <div className="absolute -bottom-6 -left-4 w-14 h-14 bg-purple-400/20 rounded-2xl -rotate-12 flex items-center justify-center backdrop-blur-sm border border-purple-400/30">
                <Wallet className="w-7 h-7 text-purple-400" />
              </div>

              {/* Main Device Mockup */}
              <div className="base-card-light p-2 transform hover:rotate-1 transition-transform duration-500">
                <div className="bg-gray-900 rounded-2xl p-1">
                  <div className="bg-black rounded-xl overflow-hidden">
                    {/* Device Screen Content */}
                    <div className="p-6 space-y-4">
                      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="text-center relative z-10">
                          <span className="text-white font-bold text-2xl block">SUI MEETUP</span>
                          <span className="text-white/80 text-sm">Web3 Conference</span>
                        </div>
                        <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute bottom-3 left-3 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                          <Coins className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold text-xl text-white">Sui Developer Conference 2024</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-white/70 text-sm">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            Dec 25, 2024 • 2:00 PM PST
                          </div>
                          <div className="flex items-center text-white/70 text-sm">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            San Francisco, CA
                          </div>
                          <div className="flex items-center text-white/70 text-sm">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                            500 SUI Bounty Pool
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-600 text-white py-3 px-6 rounded-xl text-center font-semibold">
                        Mint POAP • Free
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 sm:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <div className="space-y-4">
              <h2 className="text-heading text-white text-glow-white">
                Discover Web3 Events
                <span className="gradient-text"> & Earn Rewards</span>
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Find blockchain events, earn POAPs, complete bounties, and connect with the Sui community.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <Input
                  placeholder="Search Web3 events, bounties, or locations..."
                  className="base-input pl-12 py-4 text-lg"
                />
              </div>
              <Link href="/discover">
                <Button className="base-button-primary px-8 py-4 text-lg font-semibold">Search Events</Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {["🏗️ DeFi", "🎮 Gaming", "🎨 NFTs", "💻 Development", "🌐 Metaverse", "⚡ Infrastructure"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 glass-dark border border-white/20 rounded-full text-sm font-medium text-white/80 hover:border-blue-300 hover:bg-blue-500/10 transition-all cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-heading text-white text-glow-white mb-4">Web3-Native Event Experience</h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Built for the decentralized future with blockchain-verified attendance and community rewards.
          </p>
        </div>

        <div className="grid-responsive">
          {[
            {
              icon: Award,
              title: "Proof of Attendance",
              description:
                "Mint verifiable POAPs on Sui blockchain to prove your event attendance and build your Web3 reputation.",
              color: "green",
            },
            {
              icon: Coins,
              title: "Community Bounties",
              description:
                "Complete event challenges, contribute to projects, and earn SUI tokens through community bounty programs.",
              color: "yellow",
            },
            {
              icon: Wallet,
              title: "Wallet Integration",
              description:
                "Seamlessly connect your Sui wallet for event registration, POAP minting, and bounty rewards.",
              color: "purple",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="base-card p-8 text-center space-y-4 interactive animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-16 h-16 bg-${feature.color}-500/20 rounded-2xl flex items-center justify-center mx-auto border border-${feature.color}-400/30`}
              >
                <feature.icon className={`w-8 h-8 text-${feature.color}-400`} />
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-white/70 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-dark rounded-3xl p-12 border border-white/10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-12">Powering the Sui Ecosystem</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { value: "10,000+", label: "POAPs Minted" },
                  { value: "500+", label: "Events Hosted" },
                  { value: "50K SUI", label: "Bounties Distributed" },
                  { value: "25+", label: "Partner Projects" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold mb-2 gradient-text">{stat.value}</div>
                    <div className="text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-2 lg:col-span-1 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 suilens-gradient-blue rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold gradient-text">Suilens</span>
              </div>
              <p className="text-white/60 text-sm">Web3 event management platform built on Sui blockchain.</p>
            </div>

            {[
              {
                title: "Platform",
                links: ["Discover Events", "Create Event", "Bounties", "POAPs"],
              },
              {
                title: "Web3",
                links: ["Connect Wallet", "Rewards", "Governance"],
              },
              {
                title: "Support",
                links: ["Help Center", "Documentation", "Community"],
              },
            ].map((section, index) => (
              <div key={index} className="space-y-4">
                <h4 className="font-semibold text-white">{section.title}</h4>
                <div className="space-y-2 text-sm">
                  {section.links.map((link) => (
                    <Link key={link} href="#" className="block text-white/60 hover:text-white transition-colors">
                      {link}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60 text-sm">
            © 2024 Suilens. Built on Sui Blockchain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
