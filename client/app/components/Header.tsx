'use client';
import {
	useCurrentAccount,
	useDisconnectWallet,
} from '@mysten/dapp-kit';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileDropdown } from '../landing/ProfileDropDown';
import { useUser } from '@/context/UserContext';
import { WalletConnect } from '@/components/auth/WalletConnect';

export default function Header() {
	const { user, logout } = useUser();
	const [showDropdown, setShowDropdown] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const account = useCurrentAccount();
	const disconnectWallet = useDisconnectWallet();
	const router = useRouter();

	// Check if user is authenticated
	const isAuthenticated = user && account?.address;

	// Close mobile menu when resizing to desktop
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024 && mobileMenuOpen) {
				setMobileMenuOpen(false);
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [mobileMenuOpen]);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (showDropdown && !target.closest('.profile-dropdown-container')) {
				setShowDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [showDropdown]);

	const navItems = [
		{ name: 'Home', href: '/' },
		{ name: 'Communities', href: '/communities' },
		{ name: 'Explore', href: '/discover' },
		{ name: 'Dashboard', href: '/dashboard' },
	];

	// Handle navigation with authentication check
	const handleNavigation = (href: string) => {
		if (!isAuthenticated) {
			router.push('/auth/signin');
			return;
		}
		router.push(href);
		setMobileMenuOpen(false);
	};

	// Handle sign in/sign up navigation
	const handleSignIn = () => {
		router.push('/auth/signin');
	};

	const handleSignUp = () => {
		router.push('/auth/signup');
	};

	return (
		<header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
				<Link
					href="/landing"
					className="flex items-center space-x-3 group z-20"
				>
					<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
						<Image
							src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
							alt="Suilens Logo"
							width={60}
							height={60}
							className="object-contain"
						/>
					</div>
					<span className="text-xl sm:text-2xl font-bold text-gray-800">
						Suilens
					</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden lg:flex items-center space-x-8">
					{navItems.map((item) => (
						<button
							key={item.name}
							onClick={() => handleNavigation(item.href)}
							className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
						>
							{item.name}
						</button>
					))}
				</nav>

				<div className="flex items-center space-x-4 relative z-20">
					{/* Show WalletConnect when not authenticated */}
					{!isAuthenticated && !mobileMenuOpen && (
						<div className="hidden sm:flex items-center">
							<WalletConnect />
						</div>
					)}

					{/* Show profile dropdown when authenticated */}
					{isAuthenticated && (
						<div className="relative profile-dropdown-container">
							<button
								onClick={() => setShowDropdown((v) => !v)}
								className="focus:outline-none"
								aria-label="Open profile menu"
							>
								<img
									src={user?.avatarUrl || 'https://via.placeholder.com/100'}
									alt="Profile"
									className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 cursor-pointer"
								/>
							</button>
							{showDropdown && (
								<div className="absolute right-0 mt-2 z-50">
									<ProfileDropdown
										walletAddress={user?.walletAddress ?? account.address ?? ''}
										avatarUrl={user?.avatarUrl}
										onLogout={() => {
											setShowDropdown(false);
											disconnectWallet.mutate();
											logout?.();
										}}
									/>
								</div>
							)}
						</div>
					)}

					{/* Mobile menu button */}
					<button
						className="lg:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
					>
						{mobileMenuOpen ? (
							<X className="h-6 w-6" aria-hidden="true" />
						) : (
							<Menu className="h-6 w-6" aria-hidden="true" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Navigation Menu */}
			{mobileMenuOpen && (
				<div className="fixed inset-0 z-10 bg-white">
					<div className="pt-20 pb-6 px-4 sm:px-6 h-full overflow-y-auto">
						<nav className="flex flex-col space-y-6">
							{navItems.map((item) => (
								<button
									key={item.name}
									onClick={() => handleNavigation(item.href)}
									className="text-lg font-medium text-gray-900 hover:text-blue-600 py-2 border-b border-gray-100 text-left"
								>
									{item.name}
								</button>
							))}

							{/* Show Sign In/Sign Up buttons in mobile menu when not authenticated */}
							{!isAuthenticated && (
								<div className="py-4 space-y-3">
									<button
										onClick={handleSignIn}
										className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors border border-gray-300 rounded-lg"
									>
										Sign In
									</button>
									<button
										onClick={handleSignUp}
										className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
									>
										Sign Up
									</button>
								</div>
							)}
						</nav>
					</div>
				</div>
			)}
		</header>
	);
}