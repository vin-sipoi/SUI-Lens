'use client';

import { Button } from '@/components/ui/button';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import Header from '../components/Header';
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
		if (account && !user) {
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
			<section className="py-6 sm:py-20 lg:py-29 relative">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto text-center sm:text-left space-y-8">
						<div className="space-y-6">
							<h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-inter font-bold text-[#020B15] leading-tight">
								Discover, Create,
								<br />
								and Share Events
								<br />
								on Sui
							</h1>
							<p className="font-inter text-2xl sm:text-2xl text-[#030F1C] max-w-2xl leading-relaxed font-normal">
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
			<POAPsSection />

			<FooterSection />

			
		</div>
	);
}
