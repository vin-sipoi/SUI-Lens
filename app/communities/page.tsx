import Image from 'next/image'
import Link from 'next/link'

export default function CommunityEventsPage(){
  const events = [
    {
      id: 1,
      title: "SUI Community Ghana",
      description: "Join our vibrant community in Ghana where we explore the latest developments in blockchain technology, share knowledge, and build connections with fellow enthusiasts.",
      image: "/api/placeholder/400/250",
      category: "Community",
      link: "#"
    },
    {
      id: 2,
      title: "SUI Community Liberia",
      description: "Connect with blockchain developers and enthusiasts in Liberia. Our community focuses on education, networking, and fostering innovation in the Web3 space.",
      image: "/api/placeholder/400/250",
      category: "Community", 
      link: "#"
    },
    {
      id: 3,
      title: "SUI Community Kenya",
      description: "The Kenyan chapter of our global community brings together developers, entrepreneurs, and blockchain enthusiasts to collaborate and learn together.",
      image: "/api/placeholder/400/250",
      category: "Community",
      link: "#"
    },
    {
      id: 4,
      title: "SUI Community Nigeria",
      description: "Nigeria's largest blockchain community focused on SUI ecosystem development, education, and creating opportunities for local developers and entrepreneurs.",
      image: "/api/placeholder/400/250",
      category: "Community",
      participants: "2.1k Members", 
      link: "#"
    },
    {
      id: 5,
      title: "SUI Developers",
      description: "A dedicated space for developers working with SUI blockchain. Share code, discuss best practices, and collaborate on innovative projects.",
      image: "/api/placeholder/400/250",
      category: "Development",
      link: "#"
    },
    {
      id: 6,
      title: "SUI Community Uganda",
      description: "Uganda's growing blockchain community focused on education, innovation, and building the future of decentralized technology in East Africa.",
      image: "/api/placeholder/400/250",
      category: "Community",
      link: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 group">
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
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/communities" className="text-gray-600 hover:text-gray-900 font-medium">
                Communities
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-gray-900 font-medium">
                Events
              </Link>
              <Link href="/bounties" className="text-gray-600 hover:text-gray-900 font-medium">
                Bounties
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
                <Link href='/create'>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                       Create event
                    </button>
                </Link>
              
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by country..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                </div>
                {/* Placeholder for actual event image */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium">{event.title}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {event.description}
                </p>

                {/* Action Button */}
                <Link 
                  href={event.link}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View community events
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-12 text-center">
          <button className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Load More Communities
          </button>
        </div>
      </main>
    </div>
  )
}

