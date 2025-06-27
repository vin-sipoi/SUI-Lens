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
	{ name: "Slush", icon: "/placeholder-logo.svg" },
	{ name: "Nightly", icon: "/placeholder-logo.svg" },
	{ name: "Backpack", icon: "/placeholder-logo.svg" },
	{ name: "Hana Wallet", icon: "/placeholder-logo.svg" },
	{ name: "OKX Wallet", icon: "/placeholder-logo.svg" },
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
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="border-b border-gray-200">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/landing" className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-[#56A8FF] rounded-2xl flex items-center justify-center shadow-lg">
							<Image
								src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
								alt="SuiLens Logo"
								width={40}
								height={40}
								unoptimized
							/>
						</div>
						<span className="text-3xl font-bold text-gray-900">Suilens</span>
					</Link>
					<div className="flex items-center space-x-4">
						<Link
							href="/discover"
							className="text-gray-600 hover:text-gray-900 transition-colors"
						>
							Discover Events
						</Link>
						<ConnectButton className="base-button-secondary" />
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="min-h-[calc(100vh-80px)] flex items-stretch">
				{/* Left: Auth Card */}
				<div className="flex-1 flex flex-col justify-center px-8 py-12 max-w-xl mx-auto">
					<div className="mb-10">
						<h1 className="text-2xl font-bold mb-2">
							Welcome Back to Suilens
						</h1>
						<p className="text-gray-500">
							Login with your socials, wallet, or email to continue
						</p>
					</div>
					<div className="flex gap-4 mb-6">
						<Button
							variant="outline"
							className="flex-1 flex items-center justify-center gap-2 py-6 text-base font-medium"
						>
							<FcGoogle className="w-5 h-5" /> Sign in with Google
						</Button>
						<Button
							variant="outline"
							className="flex-1 flex items-center justify-center gap-2 py-6 text-base font-medium"
						>
							<FaApple className="w-5 h-5" /> Sign in with Apple ID
						</Button>
					</div>
					<div className="flex items-center my-6">
						<div className="flex-1 h-px bg-gray-200" />
						<span className="mx-4 text-gray-400 text-sm">
							or continue with
						</span>
						<div className="flex-1 h-px bg-gray-200" />
					</div>
					<div className="space-y-3 mb-6">
						{wallets.map((wallet) => (
							<Button
								key={wallet.name}
								variant="outline"
								className="w-full flex items-center gap-3 py-5 text-base font-medium justify-start"
							>
								<Image
									src={wallet.icon}
									alt={wallet.name}
									width={24}
									height={24}
									className="rounded"
								/>
								{wallet.name}
							</Button>
						))}
						<ConnectButton className="w-full flex items-center justify-center gap-2 py-5 text-base font-medium" />
					</div>
					<form onSubmit={handleEmailSignIn} className="space-y-6">
						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="text-gray-700 font-semibold"
							>
								Email Address
							</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<Input
									id="email"
									type="email"
									placeholder="your@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-blue-400"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-gray-700 font-semibold"
							>
								Password
							</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="pl-10 pr-12 py-3 text-lg rounded-xl border-2 focus:border-blue-400"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<label className="flex items-center space-x-2 cursor-pointer">
								<input
									type="checkbox"
									className="rounded border-gray-300"
								/>
								<span className="text-sm text-gray-600">
									Remember me
								</span>
							</label>
							<Link
								href="/auth/forgot-password"
								className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
							>
								Forgot password?
							</Link>
						</div>
						<Button
							type="submit"
							className="w-full py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
						>
							Sign In to Suilens
						</Button>
					</form>
					<div className="text-center pt-4">
						<p className="text-gray-600">
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
				{/* Right: Logo Section */}
				<div className="hidden md:flex flex-1 items-center justify-center bg-[#56A8FF] rounded-l-3xl">
					<Image
						src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
						alt="SuiLens Logo"
						width={200}
						height={200}
						unoptimized
					/>
				</div>
			</div>
		</div>
	)
}