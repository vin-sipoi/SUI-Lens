import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Coins, Calendar, Users, ExternalLink, Award } from "lucide-react"
import Link from "next/link"

const bounties = [
  {
    id: 1,
    title: "Build a Sui DApp Tutorial",
    description: "Create a comprehensive tutorial for building decentralized applications on Sui blockchain",
    event: "Sui Developer Conference 2024",
    reward: "200 SUI",
    deadline: "Dec 30, 2024",
    difficulty: "Intermediate",
    submissions: 12,
    status: "active",
    tags: ["Tutorial", "DApp", "Development"],
  },
  {
    id: 2,
    title: "Design NFT Collection for Sui",
    description: "Create a unique NFT collection with Move smart contracts and marketplace integration",
    event: "NFT Marketplace Hackathon",
    reward: "500 SUI",
    deadline: "Jan 10, 2025",
    difficulty: "Advanced",
    submissions: 8,
    status: "active",
    tags: ["NFT", "Design", "Smart Contracts"],
  },
  {
    id: 3,
    title: "Move Smart Contract Security Audit",
    description: "Perform security audit on existing Move smart contracts and provide detailed report",
    event: "DeFi on Sui Workshop",
    reward: "300 SUI",
    deadline: "Jan 5, 2025",
    difficulty: "Expert",
    submissions: 3,
    status: "active",
    tags: ["Security", "Audit", "Move"],
  },
  {
    id: 4,
    title: "Community Content Creation",
    description: "Create engaging content about Sui ecosystem for social media and blog posts",
    event: "Sui Gaming Ecosystem Meetup",
    reward: "100 SUI",
    deadline: "Jan 20, 2025",
    difficulty: "Beginner",
    submissions: 25,
    status: "active",
    tags: ["Content", "Marketing", "Community"],
  },
  {
    id: 5,
    title: "Sui Wallet Integration Guide",
    description: "Write comprehensive guide for integrating Sui wallets into web applications",
    event: "Web3 UX/UI Design Workshop",
    reward: "150 SUI",
    deadline: "Completed",
    difficulty: "Intermediate",
    submissions: 1,
    status: "completed",
    tags: ["Wallet", "Integration", "Guide"],
  },
]

export default function BountiesPage() {
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 suilens-gradient-blue rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-3xl font-bold gradient-text">Suilens</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/discover" className="text-white/70 hover:text-white transition-colors">
              Discover
            </Link>
            <Link href="/bounties" className="text-blue-400 font-semibold relative">
              Bounties
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-400 rounded-full"></div>
            </Link>
            <Link href="/create" className="text-white/70 hover:text-white transition-colors">
              Create Event
            </Link>
            <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button className="base-button-secondary">Connect Wallet</Button>
            <Link href="/bounties/create">
              <Button className="base-button-primary">Create Bounty</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Community Bounties</h1>
          <p className="text-white/70">Earn SUI tokens by contributing to the ecosystem</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-purple text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Bounties</p>
                  <p className="text-3xl font-bold">24</p>
                </div>
                <Coins className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-emerald text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Rewards</p>
                  <p className="text-3xl font-bold">15,500 SUI</p>
                </div>
                <Award className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-blue text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Contributors</p>
                  <p className="text-3xl font-bold">156</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-amber text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">89</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <Input placeholder="Search bounties by title, event, or tags..." className="base-input pl-10" />
            </div>
            <Button className="base-button-secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 cursor-pointer rounded-full">
              All Bounties
            </Badge>
            <Badge className="glass-dark border border-white/20 text-white/70 cursor-pointer rounded-full hover:bg-white/10">
              🟢 Active
            </Badge>
            <Badge className="glass-dark border border-white/20 text-white/70 cursor-pointer rounded-full hover:bg-white/10">
              💻 Development
            </Badge>
            <Badge className="glass-dark border border-white/20 text-white/70 cursor-pointer rounded-full hover:bg-white/10">
              🎨 Design
            </Badge>
            <Badge className="glass-dark border border-white/20 text-white/70 cursor-pointer rounded-full hover:bg-white/10">
              📝 Content
            </Badge>
            <Badge className="glass-dark border border-white/20 text-white/70 cursor-pointer rounded-full hover:bg-white/10">
              🔒 Security
            </Badge>
          </div>
        </div>

        {/* Bounties Grid */}
        <div className="space-y-6">
          {bounties.map((bounty) => (
            <Card
              key={bounty.id}
              className="base-card group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-3xl"
            >
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-4 gap-6 items-start">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-xl text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {bounty.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed mb-3">{bounty.description}</p>
                        <div className="flex items-center text-sm text-white/60 mb-3">
                          <Calendar className="w-4 h-4 mr-2" />
                          Event: {bounty.event}
                        </div>
                      </div>
                      <Badge
                        variant={bounty.status === "active" ? "default" : "secondary"}
                        className={`${
                          bounty.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"
                        } text-white rounded-full`}
                      >
                        {bounty.status === "active" ? "🟢 Active" : "✅ Completed"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {bounty.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="glass-dark border border-white/20 text-white/70 rounded-full text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center p-4 suilens-gradient-purple rounded-2xl">
                      <div className="text-3xl font-bold text-white mb-1">{bounty.reward}</div>
                      <div className="text-sm text-purple-100 font-medium">Reward</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 glass-dark rounded-xl">
                        <div className="font-bold text-lg text-white">{bounty.submissions}</div>
                        <div className="text-xs text-white/60">Submissions</div>
                      </div>
                      <div className="p-3 glass-dark rounded-xl">
                        <div className="font-bold text-sm text-white">{bounty.difficulty}</div>
                        <div className="text-xs text-white/60">Difficulty</div>
                      </div>
                    </div>

                    <div className="text-center text-sm text-white/60">
                      <div className="flex items-center justify-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Deadline: {bounty.deadline}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {bounty.status === "active" ? (
                      <>
                        <Button className="base-button-primary">
                          <Coins className="w-4 h-4 mr-2" />
                          Submit Work
                        </Button>
                        <Button className="base-button-secondary">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button disabled className="bg-gray-600 text-white rounded-xl">
                          ✅ Completed
                        </Button>
                        <Button className="base-button-secondary">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Submission
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button className="base-button-secondary px-8 py-4">Load More Bounties</Button>
        </div>
      </div>
    </div>
  )
}
