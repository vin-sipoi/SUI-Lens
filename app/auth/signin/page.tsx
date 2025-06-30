"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { FcGoogle } from "react-icons/fc"
import { FaApple } from "react-icons/fa"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { ConnectButton } from "@mysten/dapp-kit"
import { useRouter } from "next/navigation"

const wallets = [
	{ name: "Slush", icon: "/download (2) 1.png" },
	{ name: "Nightly", icon: "/download (3) 1.png" },
	{ name: "Backpack", icon: "/download (3) 2.png" },
	{ name: "Hana Wallet", icon: "/download (4) 1.png" },
	{ name: "OKX Wallet", icon: "/download (2) 2.png" },
]

export default function SignInPage() {
	const [showPassword, setShowPassword] = useState(false)
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const router = useRouter();

	const handleEmailSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		// Simulate successful sign in
		console.log("Signing in with email:", email);
		router.push("/dashboard");
	};

	return (
		<div className="min-h-screen font-inter bg-white">			
			{/* Main Content */}
			<div className="min-h-screen flex flex-col lg:flex-row">
				{/* Left: Auth Card */}
				<div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
					{/* Mobile Logo - Only shown on small screens */}
					<div className="flex justify-center mb-8 lg:hidden">
						<Image
							src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
							alt="SuiLens Logo"
							width={80}
							height={80}
							className="sm:w-24 sm:h-24"
							unoptimized
						/>
					</div>

					{/* Auth Form Container */}
					<div className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
						<div className="mb-8 lg:mb-10">
							<h1 className="text-[#1C1C1C] text-xl sm:text-2xl lg:text-2xl font-medium mb-2 text-center lg:text-left">
								Login to Suilens
							</h1>
							<p className="text-[#888888] text-sm sm:text-base text-center lg:text-left">
								Login with either socials or email.
							</p>
						</div>

						{/* Social Sign-in Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
							<Button
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2 py-4 sm:py-6 text-sm sm:text-base font-medium"
							>
								<FcGoogle className="w-4 h-4 sm:w-5 sm:h-5" /> 
								<span className="hidden sm:inline text-sm font-medium">Sign in with Google</span>
								<span className="sm:hidden">Google</span>
							</Button>
							<Button
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2 py-4 sm:py-6 text-sm sm:text-base font-medium"
							>
								<FaApple className="w-4 h-4 sm:w-5 sm:h-5 text-sm font-medium" /> 
								<span className="hidden sm:inline text-sm font-medium">Sign in with Apple ID</span>
								<span className="sm:hidden">Apple ID</span>
							</Button>
						</div>

						{/* Divider */}
						<div className="flex items-center my-6">
							<div className="flex-1 h-px bg-gray-200" />
							<span className="mx-4 text-[#101928] text-xs sm:text-lg font-normal">
								or continue with
							</span>
							<div className="flex-1 h-px bg-gray-200" />
						</div>

						{/* Wallet Options */}
						<div className="space-y-2 sm:space-y-3 mb-6">
							{/* Show all wallets on larger screens, only first 3 on mobile */}
							{wallets.slice(0, window?.innerWidth >= 640 ? wallets.length : 3).map((wallet) => (
								<Button
									key={wallet.name}
									variant="outline"
									className="w-full flex items-center gap-3 py-4 sm:py-5 text-sm sm:text-base font-medium justify-start"
								>
									<Image
										src={wallet.icon}
										alt={wallet.name}
										width={20}
										height={20}
										className="sm:w-6 sm:h-6 rounded"
									/>
									{wallet.name}
								</Button>
							))}
							
							{/* Show remaining wallets on mobile in a collapsible way */}
							<div className="sm:hidden">
								{wallets.length > 3 && (
									<details className="group">
										<summary className="cursor-pointer text-blue-600 text-sm font-medium py-2 list-none">
											<span className="group-open:hidden">Show more wallets</span>
											<span className="hidden group-open:inline">Show less</span>
										</summary>
										<div className="space-y-2 mt-2">
											{wallets.slice(3).map((wallet) => (
												<Button
													key={wallet.name}
													variant="outline"
													className="w-full flex items-center gap-3 py-4 text-sm font-medium justify-start"
												>
													<Image
														src={wallet.icon}
														alt={wallet.name}
														width={20}
														height={20}
														className="rounded"
													/>
													{wallet.name}
												</Button>
											))}
										</div>
									</details>
								)}
							</div>

						</div>

						{/* Email/Password Form */}
						<form onSubmit={handleEmailSignIn} className="space-y-4 sm:space-y-6">
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-gray-700 font-semibold text-sm sm:text-base"
								>
									Email Address
								</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
									<Input
										id="email"
										type="email"
										placeholder="your@email.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="pl-9 sm:pl-10 py-2.5 sm:py-3 text-base sm:text-lg rounded-xl border-2 focus:border-blue-400"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-gray-700 font-semibold text-sm sm:text-base"
								>
									Password
								</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										className="pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-base sm:text-lg rounded-xl border-2 focus:border-blue-400"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
										) : (
											<Eye className="w-4 h-4 sm:w-5 sm:h-5" />
										)}
									</button>
								</div>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
								<label className="flex items-center space-x-2 cursor-pointer">
									<input
										type="checkbox"
										className="rounded border-gray-300"
									/>
									<span className="text-xs sm:text-sm text-gray-600">
										Remember me
									</span>
								</label>
								<Link
									href="/auth/forgot-password"
									className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold"
								>
									Forgot password?
								</Link>
							</div>
							<Button
								type="submit"
								className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
							>
								Sign In to Suilens
							</Button>
						</form>
						<div className="text-center pt-4">
							<p className="text-gray-600 text-xs sm:text-sm">
								Don't have an account?{" "}
								<Link
									href="/auth/signup"
									className="text-blue-600 hover:text-blue-700 font-semibold"
								>
									Create one now
								</Link>
							</p>
						</div>
					</div>
				</div>

				{/* Right: Logo Section - Hidden on mobile, visible on large screens */}
				<div className="hidden lg:flex flex-1 items-center justify-center bg-[#56A8FF] min-h-screen">
					<div className="text-center">
						<Image
							src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
							alt="SuiLens Logo"
							width={180}
							height={180}
							className="xl:w-52 xl:h-52 2xl:w-64 2xl:h-64"
							unoptimized
						/>
						
					</div>
				</div>
			</div>
		</div>
	)
}