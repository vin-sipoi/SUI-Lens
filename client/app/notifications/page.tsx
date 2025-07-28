import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Calendar, Award, Coins, Users, Settings, Check, X, ExternalLink, Clock } from "lucide-react"
import Link from "next/link"

const notifications = [
	{
		id: 1,
		type: "event_reminder",
		title: "Event Starting Soon",
		message: "Sui Developer Conference 2024 starts in 2 hours",
		event: "Sui Developer Conference 2024",
		time: "2 hours ago",
		read: false,
		actionUrl: "/events/1",
	},
	{
		id: 2,
		type: "poap_available",
		title: "POAP Ready to Claim",
		message: "Your NFT Marketplace Hackathon POAP is ready",
		event: "NFT Marketplace Hackathon",
		time: "4 hours ago",
		read: false,
		actionUrl: "/poaps",
	},
	{
		id: 3,
		type: "bounty_completed",
		title: "Bounty Reward Received",
		message: "You received 200 SUI for completing the DApp tutorial bounty",
		event: "Sui Developer Conference 2024",
		time: "1 day ago",
		read: true,
		actionUrl: "/bounties",
	},
	{
		id: 4,
		type: "event_update",
		title: "Event Location Changed",
		message: "DeFi on Sui Workshop venue has been updated",
		event: "DeFi on Sui Workshop",
		time: "2 days ago",
		read: true,
		actionUrl: "/events/2",
	},
	{
		id: 5,
		type: "new_follower",
		title: "New Event Organizer Follow",
		message: "Sarah Chen started following your events",
		time: "3 days ago",
		read: true,
		actionUrl: "/profile/sarah-chen",
	},
	{
		id: 6,
		type: "event_cancelled",
		title: "Event Cancelled",
		message: "Holiday Art Exhibition has been cancelled due to venue issues",
		event: "Holiday Art Exhibition",
		time: "1 week ago",
		read: true,
		actionUrl: "/events/3",
	},
]

const getNotificationIcon = (type: string) => {
	switch (type) {
		case "event_reminder":
			return <Calendar className="w-5 h-5 text-blue-500" />
		case "poap_available":
			return <Award className="w-5 h-5 text-green-500" />
		case "bounty_completed":
			return <Coins className="w-5 h-5 text-purple-500" />
		case "event_update":
			return <Bell className="w-5 h-5 text-orange-500" />
		case "new_follower":
			return <Users className="w-5 h-5 text-pink-500" />
		case "event_cancelled":
			return <X className="w-5 h-5 text-red-500" />
		default:
			return <Bell className="w-5 h-5 text-gray-500" />
	}
}

const getNotificationColor = (type: string) => {
	switch (type) {
		case "event_reminder":
			return "bg-blue-50 border-blue-200"
		case "poap_available":
			return "bg-green-50 border-green-200"
		case "bounty_completed":
			return "bg-purple-50 border-purple-200"
		case "event_update":
			return "bg-orange-50 border-orange-200"
		case "new_follower":
			return "bg-pink-50 border-pink-200"
		case "event_cancelled":
			return "bg-red-50 border-red-200"
		default:
			return "bg-gray-50 border-gray-200"
	}
}

export default function NotificationsPage() {
	const unreadCount = notifications.filter((n) => !n.read).length

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
						<Link href="/discover" className="text-white/70 hover:text-white transition-colors">
							Discover
						</Link>
						<Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">
							Dashboard
						</Link>
						<Link href="/notifications" className="text-blue-400 font-semibold relative">
							Notifications
							<div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-400 rounded-full"></div>
						</Link>
					</nav>
					<div className="flex items-center space-x-4">
						<Button className="base-button-secondary">
							<Settings className="w-4 h-4 mr-2" />
							Settings
						</Button>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
				{/* Header Section */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-white mb-2 flex items-center">
								<Bell className="w-8 h-8 mr-3 text-blue-400" />
								Notifications
								{unreadCount > 0 && (
									<Badge className="ml-3 bg-red-500 text-white rounded-full">{unreadCount} new</Badge>
								)}
							</h1>
							<p className="text-white/70">Stay updated with your Web3 event activities</p>
						</div>
						<div className="flex gap-2">
							<Button className="base-button-secondary">
								<Check className="w-4 h-4 mr-2" />
								Mark All Read
							</Button>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid md:grid-cols-4 gap-6 mb-8">
					<Card className="overflow-hidden border-0 shadow-xl suilens-gradient-blue text-white rounded-3xl">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-blue-100 text-sm font-medium">Unread</p>
									<p className="text-3xl font-bold">{unreadCount}</p>
								</div>
								<Bell className="w-8 h-8 text-blue-200" />
							</div>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-0 shadow-xl suilens-gradient-emerald text-white rounded-3xl">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-green-100 text-sm font-medium">POAPs</p>
									<p className="text-3xl font-bold">3</p>
								</div>
								<Award className="w-8 h-8 text-green-200" />
							</div>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-0 shadow-xl suilens-gradient-purple text-white rounded-3xl">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-purple-100 text-sm font-medium">Bounties</p>
									<p className="text-3xl font-bold">2</p>
								</div>
								<Coins className="w-8 h-8 text-purple-200" />
							</div>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-0 shadow-xl suilens-gradient-amber text-white rounded-3xl">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-orange-100 text-sm font-medium">Events</p>
									<p className="text-3xl font-bold">5</p>
								</div>
								<Calendar className="w-8 h-8 text-orange-200" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Notifications List */}
				<Tabs defaultValue="all" className="w-full">
					<TabsList className="mb-6 glass-dark rounded-2xl p-2 border border-white/10">
						<TabsTrigger
							value="all"
							className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
						>
							All Notifications
						</TabsTrigger>
						<TabsTrigger
							value="unread"
							className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
						>
							Unread ({unreadCount})
						</TabsTrigger>
						<TabsTrigger
							value="events"
							className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
						>
							Events
						</TabsTrigger>
						<TabsTrigger
							value="rewards"
							className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
						>
							Rewards
						</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="space-y-4">
						{notifications.map((notification) => (
							<Card
								key={notification.id}
								className={`base-card-light transition-all duration-300 hover:shadow-xl ${
									!notification.read ? "ring-2 ring-blue-200" : ""
								} rounded-3xl`}
							>
								<CardContent className="p-6">
									<div className="flex items-start space-x-4">
										<div
											className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getNotificationColor(
												notification.type
											)}`}
										>
											{getNotificationIcon(notification.type)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<h3
														className={`font-semibold text-lg ${
															!notification.read ? "text-gray-900" : "text-gray-700"
														}`}
													>
														{notification.title}
													</h3>
													<p className="text-gray-600 mt-1">{notification.message}</p>
													{notification.event && (
														<div className="flex items-center mt-2 text-sm text-gray-500">
															<Calendar className="w-4 h-4 mr-1" />
															{notification.event}
														</div>
													)}
												</div>

												<div className="flex items-center space-x-3 ml-4">
													<div className="text-right">
														<div className="flex items-center text-sm text-gray-500">
															<Clock className="w-4 h-4 mr-1" />
															{notification.time}
														</div>
														{!notification.read && (
															<Badge className="mt-1 bg-blue-500 text-white text-xs rounded-full">
																New
															</Badge>
														)}
													</div>

													<div className="flex space-x-2">
														{!notification.read && (
															<Button size="sm" className="base-button-secondary">
																<Check className="w-4 h-4" />
															</Button>
														)}
														<Link href={notification.actionUrl}>
															<Button size="sm" className="base-button-primary">
																<ExternalLink className="w-4 h-4" />
															</Button>
														</Link>
													</div>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</TabsContent>

					<TabsContent value="unread" className="space-y-4">
						{notifications
							.filter((n) => !n.read)
							.map((notification) => (
								<Card
									key={notification.id}
									className="base-card-light ring-2 ring-blue-200 transition-all duration-300 hover:shadow-xl rounded-3xl"
								>
									<CardContent className="p-6">
										<div className="flex items-start space-x-4">
											<div
												className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getNotificationColor(
													notification.type
												)}`}
											>
												{getNotificationIcon(notification.type)}
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<h3 className="font-semibold text-lg text-gray-900">
															{notification.title}
														</h3>
														<p className="text-gray-600 mt-1">{notification.message}</p>
														{notification.event && (
															<div className="flex items-center mt-2 text-sm text-gray-500">
																<Calendar className="w-4 h-4 mr-1" />
																{notification.event}
															</div>
														)}
													</div>

													<div className="flex items-center space-x-3 ml-4">
														<div className="text-right">
															<div className="flex items-center text-sm text-gray-500">
																<Clock className="w-4 h-4 mr-1" />
																{notification.time}
															</div>
															<Badge className="mt-1 bg-blue-500 text-white text-xs rounded-full">
																New
															</Badge>
														</div>

														<div className="flex space-x-2">
															<Button size="sm" className="base-button-secondary">
																<Check className="w-4 h-4" />
															</Button>
															<Link href={notification.actionUrl}>
																<Button size="sm" className="base-button-primary">
																	<ExternalLink className="w-4 h-4" />
																</Button>
															</Link>
														</div>
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
					</TabsContent>

					<TabsContent value="events" className="space-y-4">
						{notifications
							.filter((n) => ["event_reminder", "event_update", "event_cancelled"].includes(n.type))
							.map((notification) => (
								<Card
									key={notification.id}
									className={`base-card-light transition-all duration-300 hover:shadow-xl ${
										!notification.read ? "ring-2 ring-blue-200" : ""
									} rounded-3xl`}
								>
									<CardContent className="p-6">
										<div className="flex items-start space-x-4">
											<div
												className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getNotificationColor(
													notification.type
												)}`}
											>
												{getNotificationIcon(notification.type)}
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<h3
															className={`font-semibold text-lg ${
																!notification.read ? "text-gray-900" : "text-gray-700"
															}`}
														>
															{notification.title}
														</h3>
														<p className="text-gray-600 mt-1">{notification.message}</p>
														{notification.event && (
															<div className="flex items-center mt-2 text-sm text-gray-500">
																<Calendar className="w-4 h-4 mr-1" />
																{notification.event}
															</div>
														)}
													</div>

													<div className="flex items-center space-x-3 ml-4">
														<div className="text-right">
															<div className="flex items-center text-sm text-gray-500">
																<Clock className="w-4 h-4 mr-1" />
																{notification.time}
															</div>
															{!notification.read && (
																<Badge className="mt-1 bg-blue-500 text-white text-xs rounded-full">
																	New
																</Badge>
															)}
														</div>

														<div className="flex space-x-2">
															{!notification.read && (
																<Button size="sm" className="base-button-secondary">
																	<Check className="w-4 h-4" />
																</Button>
															)}
															<Link href={notification.actionUrl}>
																<Button size="sm" className="base-button-primary">
																	<ExternalLink className="w-4 h-4" />
																</Button>
															</Link>
														</div>
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
					</TabsContent>

					<TabsContent value="rewards" className="space-y-4">
						{notifications
							.filter((n) => ["poap_available", "bounty_completed"].includes(n.type))
							.map((notification) => (
								<Card
									key={notification.id}
									className={`base-card-light transition-all duration-300 hover:shadow-xl ${
										!notification.read ? "ring-2 ring-blue-200" : ""
									} rounded-3xl`}
								>
									<CardContent className="p-6">
										<div className="flex items-start space-x-4">
											<div
												className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getNotificationColor(
													notification.type
												)}`}
											>
												{getNotificationIcon(notification.type)}
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<h3
															className={`font-semibold text-lg ${
																!notification.read ? "text-gray-900" : "text-gray-700"
															}`}
														>
															{notification.title}
														</h3>
														<p className="text-gray-600 mt-1">{notification.message}</p>
														{notification.event && (
															<div className="flex items-center mt-2 text-sm text-gray-500">
																<Calendar className="w-4 h-4 mr-1" />
																{notification.event}
															</div>
														)}
													</div>

													<div className="flex items-center space-x-3 ml-4">
														<div className="text-right">
															<div className="flex items-center text-sm text-gray-500">
																<Clock className="w-4 h-4 mr-1" />
																{notification.time}
															</div>
															{!notification.read && (
																<Badge className="mt-1 bg-blue-500 text-white text-xs rounded-full">
																	New
																</Badge>
															)}
														</div>

														<div className="flex space-x-2">
															{!notification.read && (
																<Button size="sm" className="base-button-secondary">
																	<Check className="w-4 h-4" />
																</Button>
															)}
															<Link href={notification.actionUrl}>
																<Button size="sm" className="base-button-primary">
																	<ExternalLink className="w-4 h-4" />
																</Button>
															</Link>
														</div>
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
					</TabsContent>
				</Tabs>

				{/* Empty State */}
				{notifications.length === 0 && (
					<div className="text-center py-16">
						<div className="w-24 h-24 suilens-gradient-blue rounded-full flex items-center justify-center mx-auto mb-6">
							<Bell className="w-12 h-12 text-white" />
						</div>
						<h3 className="text-2xl font-bold text-white mb-3">All caught up!</h3>
						<p className="text-white/70 text-lg">You have no new notifications</p>
					</div>
				)}
			</div>
		</div>
	)
}
