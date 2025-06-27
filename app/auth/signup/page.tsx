"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { FcGoogle } from "react-icons/fc"
import { FaApple, FaWallet } from "react-icons/fa"

const wallets = [
	{ name: "Slush", icon: "/placeholder-logo.svg" },
	{ name: "Nightly", icon: "/placeholder-logo.svg" },
	{ name: "Backpack", icon: "/placeholder-logo.svg" },
	{ name: "Hana Wallet", icon: "/placeholder-logo.svg" },
	{ name: "OKX Wallet", icon: "/placeholder-logo.svg" },
]

export default function SignUpPage() {
	return (
		<div className="min-h-screen flex items-stretch bg-white">
			{/* Left: Auth Card */}
			<div className="flex-1 flex flex-col justify-center px-8 py-12 max-w-xl mx-auto">
				<div className="mb-10">
					<h1 className="text-2xl font-bold mb-2">Get Started on Suilens</h1>
					<p className="text-gray-500">
						Login with one of your socials to start interacting with Suilens
					</p>
				</div>
				<div className="flex gap-4 mb-6">
					<Button
						variant="outline"
						className="flex-1 flex items-center justify-center gap-2 py-6 text-base font-medium"
					>
						<FcGoogle className="w-5 h-5" /> Sign up with Google
					</Button>
					<Button
						variant="outline"
						className="flex-1 flex items-center justify-center gap-2 py-6 text-base font-medium"
					>
						<FaApple className="w-5 h-5" /> Sign up with Apple ID
					</Button>
				</div>
				<div className="flex items-center my-6">
					<div className="flex-1 h-px bg-gray-200" />
					<span className="mx-4 text-gray-400 text-sm">
						or continue with
					</span>
					<div className="flex-1 h-px bg-gray-200" />
				</div>
				<div className="space-y-3">
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
				</div>
			</div>
			{/* Right: Logo Section */}
			<div className="hidden md:flex flex-1 items-center justify-center bg-[#56A8FF] rounded-l-3xl">
				<Image
					src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
					alt="SuiLens Logo"
					width={200}
					height={200}
				/>
			</div>
		</div>
	)
}