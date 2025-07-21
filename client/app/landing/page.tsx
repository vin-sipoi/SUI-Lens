'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useCurrentAccount } from '@mysten/dapp-kit';
import {
	ArrowRight,
	Calendar,
	Mail,
	MapPin,
	Menu,
	Users,
	X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import Header from '../components/Header';

type Event = {
	id: number;
	title: string;
	description: string;
	date: string;
	location: string;
	attendees: number;
	category: string;
};

export default function HomePage() {
	const { login, user, logout } = useUser();
	const account = useCurrentAccount();

	const [events, setEvents] = useState<Event[]>([]);
	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const res = await fetch('/api/events');
				const data = await res.json();
				setEvents(data.events || []);
			} catch (error) {
				console.error('Error fetching events:', error);
				setEvents([]); // fallback to empty array on error
			}
		};
		fetchEvents();
	}, []);
	const [email, setEmail] = useState('');
	const [showDropdown, setShowDropdown] = useState(false);
	
	// When wallet connects, log in with wallet address
	useEffect(() => {
		if (account && !user) {
			login({
				name: 'Sui User',
				email: '',
				emails: [{ address: '', primary: true, verified: false }],
				avatarUrl: 'https://via.placeholder.com/100',
				walletAddress: account.address,
			});
		}
	}, [account, login, user]);

	useEffect(() => {
		if (!user) setShowDropdown(false);
	}, [user]);

	// Function to add a new event
	const addEvent = (newEvent: Omit<Event, 'id'>) => {
		setEvents((prevEvents) => [...prevEvents, { ...newEvent, id: Date.now() }]);
	};

	// Function to remove an event
	const removeEvent = (eventId: number): void => {
		setEvents((prevEvents: Event[]) =>
			prevEvents.filter((event: Event) => event.id !== eventId)
		);
	};

	const handleNewsletterSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Newsletter subscription:', email);
		setEmail('');
	};

	const communities = [
		{
			name: 'Sui Kenya',
			image: 'https://i.ibb.co/YBvqHqsp/Screenshot-2025-06-24-030451.png',
		},
		{
			name: 'Sui Ghana',
			image: 'https://i.ibb.co/LDDGGYdF/Screenshot-2025-06-24-141355.png',
		},
		{
			name: 'Sui Nigeria',
			image: 'https://i.ibb.co/W4zMd77q/Screenshot-2025-06-24-030948.png',
		},
		{
			name: 'Sui in Paris',
			image: 'https://i.ibb.co/ZpKnvQQ1/Screenshot-2025-06-24-031327.png',
		},
	];

	return (
		<div className="min-h-screen font-inter bg-gradient-to-b from-blue-400 via-blue-100 to-blue-50">
			{/* Header */}
			<Header />

			{/* Hero Section */}
			<section className="py-6 sm:py-20 lg:py-29 relative">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto text-center sm:text-left space-y-8">
						<div className="space-y-6">
							<h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-6xl font-inter font-bold text-[#020B15] leading-tight">
								Discover, Create,
								<br />
								and Share Events
								<br />
								on Sui
							</h1>
							<p className="font-inter text-xl sm:text-2xl text-[#030F1C] max-w-2xl leading-relaxed font-normal">
								From small meetups to large programs, Suilens makes it easy to
								find community events, host your own, and connect with the Sui
								community.
							</p>
						</div>

						<div className="pt-4">
							<Link href="/discover">
								<Button className="w-full sm:w-auto bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white font-inter px-6 sm:px-7 py-4 sm:py-7 text-base sm:text-lg font-medium rounded-xl shadow-lg">
									Start Exploring
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Community Events Grid */}
			<section className="py-12 sm:py-16 relative">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-12 p-2 sm:p-7">
							{communities.map((community, index) => (
								<div
									key={community.name}
									className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer min-h-[250px] sm:min-h-[400px]"
								>
									<div className="h-full relative overflow-hidden">
										<img
											src={community.image}
											alt={`${community.name} community event`}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
										<div className="absolute top-4 left-4">
											<span className="bg-white backdrop-blur-sm text-gray-800 px-4 sm:px-6 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-medium">
												{community.name}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* View More Button */}
						<div className="text-center">
							<Link href="/communities">
								<Button className="w-full sm:w-auto bg-[#4DA2FF] text-gray-200 hover:bg-blue-500 px-6 sm:px-9 py-6 sm:py-8 text-base sm:text-lg font-semibold rounded-lg shadow-lg">
									See More
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* POAPs Section */}
			<section className="py-12 sm:py-16 relative bg-[#030F1C]">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto space-y-12">
						{/* POAP Feature - Text Left, Image Right (stacked on mobile) */}
						<div className="overflow-hidden group cursor-pointer min-h-[200px] sm:min-h-[300px]">
							<div className="h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
								<div className="py-5 text-[#EDF6FF]">
									<h3 className="text-3xl sm:text-4xl lg:text-5xl font-medium mb-4">
										Add POAPs to Your <br className="hidden sm:block" /> Events
									</h3>
									<p className="text-gray-300 font-normal mb-6 text-lg sm:text-xl lg:text-2xl">
										Reward attendees with Proof of Attendance Protocol (POAP)
										NFTs for joining your event.
									</p>
									<Link href="/create">
										<button className="text-blue-100 font-normal underline text-lg sm:text-xl lg:text-2xl">
											Create your event
										</button>
									</Link>
								</div>
								<div className="flex items-center justify-center">
									<div className="w-full max-w-2xl max-h-[245]">
										<img
											src="https://i.ibb.co/dwwYhvJW/Screenshot-2025-06-25-022109.png"
											alt="POAP feature"
											height={200}
											className="w-full h-auto object-contain rounded-lg"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Bounty & Grant Tracking Feature - Image Left, Text Right (stacked on mobile) */}
						<div className="overflow-hidden group cursor-pointer min-h-[200px] sm:min-h-[300px]">
							<div className="h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
								<div className="flex items-center justify-center order-2 md:order-1">
									<div className="w-full max-w-2xl max-h-[245]">
										<img
											src="https://i.ibb.co/B5k0jnXv/Screenshot-2025-06-25-030420.png"
											alt="Grant photo"
											height={200}
											className="w-full h-auto object-contain rounded-lg"
										/>
									</div>
								</div>
								<div className="py-5 text-[#EDF6FF] order-1 md:order-2">
									<h3 className="text-3xl sm:text-4xl lg:text-5xl font-medium mb-4">
										Bounty & Grant Tracking for Leads Events
									</h3>
									<p className="text-gray-300 font-normal mb-6 text-lg sm:text-xl lg:text-2xl">
										Community leads can easily track bounties, report progress,
										and manage grants in one place
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Newsletter Section */}
			<section className="py-12 sm:py-16 bg-gray-50">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-2xl mx-auto text-center">
						<h2 className="text-3xl sm:text-4xl font-medium text-gray-900 mb-4">
							Subscribe to our Newsletter
						</h2>
						<p className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-600 mb-8">
							Stay updated with the latest Sui community events and
							announcements
						</p>
						<form
							onSubmit={handleNewsletterSubmit}
							className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
						>
							<div className="flex-1 relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<Input
									type="email"
									placeholder="Enter your email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-10 h-12 sm:h-14 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									required
								/>
							</div>
							<Button
								type="submit"
								className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white font-inter px-6 sm:px-10 h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl shadow-lg"
							>
								Subscribe
							</Button>
						</form>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-100 py-8">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
						{/* Left side - Logo and Links */}
						<div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
							{/* Logo */}
							<div className="flex items-center space-x-3">
								<Link href="/landing" className="flex items-center space-x-3">
									<div className="w-8 h-8 rounded-lg flex items-center justify-center">
										<Image
											src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
											alt="Suilens Logo"
											width={32}
											height={32}
											className="object-contain"
										/>
									</div>
									<span className="text-xl font-bold text-gray-900">
										Suilens
									</span>
								</Link>
							</div>

							{/* Links */}
							<div className="flex space-x-6 font-medium text-sm text-gray-600">
								<Link href="/privacy" className="hover:text-gray-900">
									Privacy Policy
								</Link>
								<Link href="/terms" className="hover:text-gray-900">
									Terms of Use
								</Link>
							</div>
						</div>

						{/* Right side - Copyright */}
						<p className="text-sm font-medium text-gray-600">
							© 2025 Suilens. All Rights Reserved.
						</p>
					</div>
				</div>
			</footer>

			{/* Dynamic Events Section (Hidden when no events, preserving functionality) */}
			{events.length > 0 && (
				<section className="py-12 sm:py-16 relative bg-white/10 backdrop-blur-sm">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="max-w-6xl mx-auto">
							<div className="flex items-center justify-between mb-8 sm:mb-12">
								<div>
									<h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
										Your Events
									</h2>
									<p className="text-white/80">Manage your created events</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8">
								{events.map((event) => (
									<div
										key={event.id}
										className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group"
									>
										<div className="flex items-start justify-between mb-4">
											<div className="flex-1">
												<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
													{event.title}
												</h3>
												<p className="text-gray-600 text-sm mb-4 line-clamp-2">
													{event.description}
												</p>
											</div>
											<Button
												onClick={() => removeEvent(event.id)}
												className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
												variant="ghost"
												size="sm"
											>
												×
											</Button>
										</div>

										<div className="space-y-3 mb-6">
											<div className="flex items-center text-gray-600 text-xs sm:text-sm">
												<Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
												<span className="truncate">
													{new Date(event.date).toLocaleDateString()}
												</span>
											</div>
											<div className="flex items-center text-gray-600 text-xs sm:text-sm">
												<MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
												<span className="truncate">{event.location}</span>
											</div>
											<div className="flex items-center text-gray-600 text-xs sm:text-sm">
												<Users className="w-4 h-4 mr-2 flex-shrink-0" />
												<span>{event.attendees} attendees</span>
											</div>
										</div>

										<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
											<span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
												{event.category}
											</span>
											<Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-4 py-2 rounded-lg">
												View Event
												<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>
			)}
		</div>
	);
}
