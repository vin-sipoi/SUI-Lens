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
import POAPsPage from '../poaps/page';
import POAPsSection from '@/components/PoapSection';
import FooterSection from '@/components/FooterSection';

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
		if (account && !user && account.address) {
			login({
				name: 'Sui User',
				email: '',
				emails: [{ address: '', primary: true, verified: false }],
				avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens',
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
			<section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 relative">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
					<div className="max-w-6xl mx-auto text-center space-y-6 sm:space-y-8 md:space-y-10">
						<div className="space-y-4 sm:space-y-6">
							<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-inter font-bold text-[#020B15] leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
								Discover, Create,
								<br className="hidden sm:block" />
								<span className="sm:hidden"> </span>and Share Events
								<br className="hidden sm:block" />
								<span className="sm:hidden"> </span>on Sui
							</h1>
							<p className="font-inter text-base sm:text-lg md:text-xl lg:text-2xl text-[#030F1C] max-w-4xl mx-auto leading-relaxed font-normal px-2 sm:px-0">
								From small meetups to large programs, Suilens makes it easy to
								find community events, host your own, and connect with the Sui
								community.
							</p>
						</div>

						<div className="pt-2 sm:pt-4">
							<Link href="/discover">
								<Button className="w-full sm:w-auto bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white font-inter px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105  duration-200">
									Start Exploring
									<ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Community Events Grid */}
			<section className="py-8 sm:py-12 md:py-16 lg:py-20 relative">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
					<div className="max-w-7xl mx-auto">
						{/* Section Header */}
						<div className="text-center mb-8 sm:mb-12 md:mb-16">
							<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#020B15] mb-3 sm:mb-4">
								Community Events
							</h2>
							<p className="text-sm sm:text-base md:text-lg text-[#030F1C] max-w-2xl mx-auto px-2 sm:px-0">
								Join vibrant communities and discover amazing events happening around the world
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
							{communities.map((community, index) => (
								<div
									key={community.name}
									className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] xl:min-h-[400px]"
								>
									<div className="h-full relative overflow-hidden">
										<img
											src={community.image}
											alt={`${community.name} community event`}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										<div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6">
											<span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 sm:px-4 md:px-6 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-medium shadow-md">
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
								<Button className="w-full sm:w-auto bg-[#4DA2FF] text-white hover:bg-blue-500 px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
									See More Communities
									<ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* POAPs Section */}
			<POAPsSection />

			<FooterSection />

			
		</div>
	);
}
