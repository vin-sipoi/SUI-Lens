'use client';
import {
	useCurrentAccount,
	useDisconnectWallet,
} from '@mysten/dapp-kit';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileDropdown } from '../landing/ProfileDropDown';
import { useUser } from '@/context/UserContext';
import { WalletConnect } from '@/components/auth/WalletConnect';
import { useZkLogin } from '@mysten/enoki/react';
import { useEnokiFlow } from '@mysten/enoki/react';
import { Button } from '@/components/ui/button';

export default function Header() {
	const { user, logout } = useUser();
	const [showDropdown, setShowDropdown] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const account = useCurrentAccount();
	const { address: enokiAddress } = useZkLogin();
	const enokiFlow = useEnokiFlow();
	const disconnectWallet = useDisconnectWallet();
	const router = useRouter();
	const pathname = usePathname();

	// Check if user is authenticated - check localStorage user or wallet connections
	const isAuthenticated = mounted && !!(user?.walletAddress || account?.address || enokiAddress);

	// Helper function to check if a link is active
	const isLinkActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
    return pathname ? pathname.startsWith(href) : false;
	};

	useEffect(() => {
		setMounted(true);
	}, []);

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

	// Debug z-index issues when mobile menu is open
	useEffect(() => {
		if (mobileMenuOpen) {
			console.log('Mobile menu opened');
			// Check z-index of all elements
			const allElements = document.querySelectorAll('*');
			const elementsWithZIndex: any[] = [];
			
			allElements.forEach((el) => {
				const computed = window.getComputedStyle(el);
				const zIndex = computed.getPropertyValue('z-index');
				if (zIndex !== 'auto' && zIndex !== '0') {
					elementsWithZIndex.push({
						element: el,
						tagName: el.tagName,
						className: el.className,
						zIndex: zIndex,
						position: computed.getPropertyValue('position')
					});
				}
			});
			
			// Sort by z-index value
			elementsWithZIndex.sort((a, b) => parseInt(b.zIndex) - parseInt(a.zIndex));
			
			console.log('Elements with z-index (sorted high to low):', elementsWithZIndex);
			const mobileMenu = document.querySelector('.fixed.inset-0');
			if (mobileMenu) {
				console.log('Mobile menu div z-index:', window.getComputedStyle(mobileMenu).zIndex);
			}
			
			// Log the actual z-index values to see what's overlapping
			console.log('Z-index values breakdown:');
			elementsWithZIndex.forEach(item => {
				console.log(`- ${item.tagName}.${item.className}: z-index ${item.zIndex}, position: ${item.position}`);
			});
		}
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
		{ name: 'Bounties', href: '/bounties' },
	];

	// Handle navigation - no authentication check for public pages
	const handleNavigation = (href: string) => {
		// Only check authentication for protected routes like dashboard
		if (href === '/dashboard' && !isAuthenticated) {
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
		<>
			<header className="bg-white border-b sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-20">
            <Image
              src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
              alt="Suilens Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="text-lg font-semibold text-[#020B15]">
              Suilens
            </span>
          </Link>

          {/* Center Nav - Desktop Only */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex gap-4 lg:gap-8 text-sm font-medium text-gray-500">
              <li>
                <Link 
                  href="/"
                  className={isLinkActive('/') ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-700'}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/communities"
                  className={isLinkActive('/communities') ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-700'}
                >
                  Communities
                </Link>
              </li>
              <li>
                <Link 
                  href="/discover"
                  className={isLinkActive('/discover') ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-700'}
                >
                  Discover Events
                </Link>
              </li>
              <li>
                <Link 
                  href="/bounties"
                  className={isLinkActive('/bounties') ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-700'}
                >
                  Bounties
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard"
                  className={isLinkActive('/dashboard') ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-700'}
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none z-20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {!user && (
              <>
                <Link href="/auth/signin">
                  <Button className="bg-transparent text-blue-500 hover:bg-blue-100 border border-blue-500 px-4 py-2 rounded-lg">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            {user && (
              <>
                <Link href="/create">
                  <Button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl">
                    Create Event
                  </Button>
                </Link>
                <Link href="/profile">
                  {mounted ? (
                    <img
                      src={user.avatarUrl || '/placeholder-user.jpg'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-200 animate-pulse" />
                  )}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-10 bg-white pt-16 pb-6 px-4">
            <nav className="flex flex-col space-y-6">
              <Link
                href="/"
                className={`text-lg py-2 border-b border-gray-100 ${
                  isLinkActive('/') 
                    ? 'font-bold text-black' 
                    : 'font-medium text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/communities"
                className={`text-lg py-2 border-b border-gray-100 ${
                  isLinkActive('/communities') 
                    ? 'font-bold text-black' 
                    : 'font-medium text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Communities
              </Link>
              <Link
                href="/discover"
                className={`text-lg py-2 border-b border-gray-100 ${
                  isLinkActive('/discover') 
                    ? 'font-bold text-black' 
                    : 'font-medium text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Discover Events
              </Link>
              <Link
                href="/bounties"
                className={`text-lg py-2 border-b border-gray-100 ${
                  isLinkActive('/bounties') 
                    ? 'font-bold text-black' 
                    : 'font-medium text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Bounties
              </Link>
              <Link
                href="/dashboard"
                className={`text-lg py-2 border-b border-gray-100 ${
                  isLinkActive('/dashboard') 
                    ? 'font-bold text-black' 
                    : 'font-medium text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-4 pt-4">
                {!user ? (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-transparent text-blue-500 hover:bg-blue-100 border border-blue-500 py-2 rounded-lg">
                        Login
                      </Button>
                    </Link>
                    
                  </>
                ) : (
                  <>
                    <Link
                      href="/create"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white py-2 rounded-xl">
                        Create Event
                      </Button>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2">
                        {mounted ? (
                          <img
                            src={user.avatarUrl || '/placeholder-user.jpg'}
                            alt="Profile"
                            className="w-6 h-6 rounded-full border border-gray-200"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-gray-200 bg-gray-200 animate-pulse" />
                        )}
                        My Profile
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      	</header>

			{/* Mobile Navigation Menu - Outside of header */}
			{mobileMenuOpen && (
				<div className="fixed left-0 right-0 top-[72px] z-[9999] bg-white shadow-lg border-b border-gray-200 lg:hidden">
					<div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
						<nav className="flex flex-col space-y-3">
							{navItems.map((item) => (
								<button
									key={item.name}
									onClick={() => handleNavigation(item.href)}
									className={`text-base px-3 py-2 rounded-lg text-left transition-colors ${
										isLinkActive(item.href)
											? 'font-bold text-black bg-gray-100'
											: 'font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50'
									}`}
								>
									{item.name}
								</button>
							))}

							{/* Show Sign In/Sign Up buttons ONLY when NOT authenticated */}
							{!isAuthenticated && (
								<div className="pt-3 mt-3 border-t border-gray-200 space-y-3">
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
		</>
	);
}