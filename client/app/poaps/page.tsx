import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Award, Calendar, Users, ExternalLink, Download } from "lucide-react"
import Link from "next/link"

const poaps = [
	{
		id: 1,
		name: "Sui Developer Conference 2024",
		event: "Sui Developer Conference 2024",
		date: "Dec 25, 2024",
		holders: 445,
		totalMinted: 450,
		image: "/placeholder.svg?height=200&width=200",
		status: "minted",
		description: "Commemorative POAP for attending the premier Sui developer conference",
	},
	{
		id: 2,
		name: "DeFi Pioneer",
		event: "DeFi on Sui Workshop",
		date: "Dec 28, 2024",
		holders: 0,
		totalMinted: 0,
		image: "/placeholder.svg?height=200&width=200",
		status: "upcoming",
		description: "Exclusive POAP for early DeFi adopters on Sui blockchain",
	},
	{
		id: 3,
		name: "NFT Creator Badge",
		event: "NFT Marketplace Hackathon",
		date: "Jan 5, 2025",
		holders: 275,
		totalMinted: 280,
		image: "/placeholder.svg?height=200&width=200",
		status: "minted",
		description: "Recognition for participating in the NFT marketplace hackathon",
	},
	{
		id: 4,
		name: "Move Master",
		event: "Move Smart Contract Bootcamp",
		date: "Jan 12, 2025",
		holders: 0,
		totalMinted: 0,
		image: "/placeholder.svg?height=200&width=200",
		status: "upcoming",
		description: "Achievement badge for mastering Move programming language",
	},
	{
		id: 5,
		name: "Gaming Pioneer",
		event: "Sui Gaming Ecosystem Meetup",
		date: "Jan 18, 2025",
		holders: 0,
		totalMinted: 0,
		image: "/placeholder.svg?height=200&width=200",
		status: "upcoming",
		description: "Special POAP for early supporters of Sui gaming ecosystem",
	},
	{
		id: 6,
		name: "Design Innovator",
		event: "Web3 UX/UI Design Workshop",
		date: "Jan 25, 2025",
		holders: 0,
		totalMinted: 0,
		image: "/placeholder.svg?height=200&width=200",
		status: "upcoming",
		description: "Recognition for contributing to Web3 design innovation",
	},
]

export default function POAPsPage() {
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
					<Link href="/landing" className="flex items-center space-x-3">
						<div className="w-10 h-10 suilens-gradient-blue rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
							<span className="text-white font-bold text-lg">S</span>
						</div>
						<span className="text-3xl font-bold gradient-text">Suilens</span>
					</Link>
					<nav className="hidden md:flex items-center space-x-8">
						<Link
							href="/discover"
							className="text-white/70 hover:text-white transition-colors"
						>
							Discover
						</Link>
						<Link href="/bounties" className="text-white/70 hover:text-white transition-colors">
							Bounties
						</Link>
						<Link href="/poaps" className="text-blue-400 font-semibold relative">
							POAPs
							<div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-400 rounded-full"></div>
						</Link>
						<Link
							href="/dashboard"
							className="text-white/70 hover:text-white transition-colors"
						>
							Dashboard
						</Link>
					</nav>
					<div className="flex items-center space-x-4">
						<Button className="base-button-secondary">Connect Wallet</Button>
						<Button className="base-button-primary">
							<Award className="w-4 h-4 mr-2" />
							My POAPs
						</Button>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8 relative z-10">
				{/* Header Section */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">
						Proof of Attendance Protocol
					</h1>
					<p className="text-white/70">
						Collect verifiable badges for attending Sui ecosystem events
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid md:grid-cols-4 gap-6 mb-8">
					<Card className="overflow-hidden border-0 shadow-xl suilens-gradient-emerald text-white rounded-3xl">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-green-100 text-sm font-medium">Total POAPs</p>
									<p className="text-3xl font-bold">12,450</p>
								</div>
								<Award className="w-8 h-8 text-green-200" />
							</div>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-0 shadow-xl suilens-gradient-blue text-white rounded-3xl">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-blue-100 text-sm font-medium">Unique Holders</p>
									<p className="text-3xl font-bold">8,920</p>
								</div>
								<Users className="w-8 h-8 text-blue-200" />
							</div>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-0 shadow-xl suilens-gradient-purple text-white rounded-3xl">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-purple-100 text-sm font-medium">Events</p>
									<p className="text-3xl font-bold">24</p>
								</div>
								<Calendar className="w-8 h-8 text-purple-200" />
							</div>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-0 shadow-xl suilens-gradient-amber text-white rounded-3xl">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-orange-100 text-sm font-medium">Success Rate</p>
									<p className="text-3xl font-bold">94.1%</p>
								</div>
								<Download className="w-8 h-8 text-orange-200" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Search and Filters */}
				<div className="mb-8 space-y-4">
					<div className="flex gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
							<Input
								placeholder="Search POAPs by name, event, or date..."
								className="base-input pl-10"
							/>
						</div>
						<Button className="base-button-secondary">
							<Filter className="w-4 h-4 mr-2" />
							Filters
						</Button>
					</div>

					<div className="flex gap-2 flex-wrap">
						<Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 cursor-pointer rounded-full">
							All POAPs
						</Badge>
						<Badge className="glass-dark border border-white/20 text-white/70 cursor-pointer rounded-full hover:bg-white/10">
							🟢 Available
						</Badge>
						<Badge className="glass-dark border border-white/20 text-white/70 cursor-pointer rounded-full hover:bg-white/10">
							✅ Minted
						</Badge>
						<Badge className="glass-dark border border-white/20 text-white/70 cursor-pointer rounded-full hover:bg-white/10">
							🔜 Upcoming
						</Badge>
						<Badge className="glass-dark border border-white/20 text-white/70 cursor-pointer rounded-full hover:bg-white/10">
							💻 Development
						</Badge>
						<Badge className="glass-dark border border-white/20 text-white/70 cursor-pointer rounded-full hover:bg-white/10">
							🎮 Gaming
						</Badge>
					</div>
				</div>

				{/* POAPs Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{poaps.map((poap) => (
						<Card
							key={poap.id}
							className="base-card-light group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl"
						>
							<div className="relative overflow-hidden">
								<div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
									<div className="w-32 h-32 suilens-gradient-blue rounded-full flex items-center justify-center shadow-2xl">
										<Award className="w-16 h-16 text-white" />
									</div>
								</div>
								<Badge
									className={`absolute top-3 right-3 font-semibold px-3 py-1 rounded-full shadow-lg ${
										poap.status === "minted"
											? "bg-green-500 text-white"
											: "bg-blue-500 text-white"
									}`}
								>
									{poap.status === "minted" ? "✅ Minted" : "🔜 Upcoming"}
								</Badge>
							</div>

							<CardHeader className="pb-3">
								<CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
									{poap.name}
								</CardTitle>
							</CardHeader>

							<CardContent className="space-y-4">
								<p className="text-sm text-gray-600 line-clamp-2">{poap.description}</p>

								<div className="space-y-3 text-sm text-gray-600">
									<div className="flex items-center">
										<Calendar className="w-4 h-4 mr-2" />
										{poap.date}
									</div>
									<div className="flex items-center">
										<Users className="w-4 h-4 mr-2" />
										{poap.holders} holders
										{poap.totalMinted > 0 && ` of ${poap.totalMinted} minted`}
									</div>
								</div>

								{poap.status === "minted" && (
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="suilens-gradient-emerald h-2 rounded-full transition-all duration-500"
											style={{
												width: `${(poap.holders / poap.totalMinted) * 100}%`,
											}}
										></div>
									</div>
								)}

								<div className="flex gap-2 pt-3 border-t border-gray-100">
									{poap.status === "minted" ? (
										<>
											<Button size="sm" className="flex-1 base-button-primary">
												<Award className="w-4 h-4 mr-2" />
												Claim POAP
											</Button>
											<Button className="base-button-secondary">
												<ExternalLink className="w-4 h-4" />
											</Button>
										</>
									) : (
										<>
											<Button
												size="sm"
												className="flex-1 bg-gray-400 text-white rounded-xl"
												disabled
											>
												Coming Soon
											</Button>
											<Button className="base-button-secondary">
												<ExternalLink className="w-4 h-4" />
											</Button>
										</>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Load More */}
				<div className="text-center mt-12">
					<Button className="base-button-secondary px-8 py-4">Load More POAPs</Button>
				</div>
			</div>
		</div>
	)
}
