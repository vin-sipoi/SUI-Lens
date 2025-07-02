import React from 'react';
import Image from 'next/image'; 
import Link from 'next/link';

const EventPage: React.FC = () => {
  const mainEvent = {
    title: 'Game Night in Ghana',
    image: 'https://i.ibb.co/8DGCTXfs/Go-Qzp-CXYAAgop4.jpg',
    description: 'The Sui community in Ghana is hosting a game night on the date. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Acu more sui events remotes claim problem adopting datum.',
    date: 'June 24, 2025, 02:23 PM EAT',
  };

  const otherEvents = [
    {
      title: 'Developer Meetup',
      image: 'https://via.placeholder.com/300x200?text=Developer+Meetup',
      type: 'Bootcamp',
    },
    {
      title: 'CONTENT CREATORS BOOTCAMP',
      image: 'https://via.placeholder.com/300x200?text=Content+Creators+Bootcamp',
      type: 'Bootcamp',
    },
    {
      title: 'Sui Community Meetup',
      image: 'https://via.placeholder.com/300x200?text=Sui+Community+Meetup',
      type: 'Meetup',
    },
    {
      title: 'Developers Night',
      image: 'https://via.placeholder.com/300x200?text=Developers+Night',
      type: 'Night',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Image 
              src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
              alt="Suilens Logo" 
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-gray-800">Suilens</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {["Home", "Communities", "Explore", "Dashboard"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {/* Main Event Section */}
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden"
        style={{ backgroundImage: `url(${mainEvent.image})`, height: '700px', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
          <div className="absolute insert-0 bg-black bg-opacity-40"></div>
          <div className="pl-6 text-white">
            <h1 className="text-3xl font-bold">{mainEvent.title}</h1>
            <p className="text-white-600 mt-2">{mainEvent.description}</p>
            <p className="text-sm text-white-500 mt-2">{mainEvent.date}</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Register Now
            </button>
          </div>
        </div>

        {/* Other Events Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Other Sui Events in Ghana</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherEvents.map((event, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.type}</p>
                  <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;