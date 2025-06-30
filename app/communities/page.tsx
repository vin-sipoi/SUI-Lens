import Image from 'next/image'
import Link from 'next/link'

export default function CommunityEventsPage(){

  const events = [
    {
      id: 1,
      title: "SUI Community Ghana",
      description: "Join our vibrant community in Ghana where we explore the latest developments in blockchain technology, share knowledge, and build connections with fellow enthusiasts.",
      image: "https://i.ibb.co/LDDGGYdF/Screenshot-2025-06-24-141355.png",
      category: "Community",
      link: '/communities/ghana'
    },
    {
      id: 3,
      title: "SUI Community Kenya",
      description: "The Kenyan chapter of our global community brings together developers, entrepreneurs, and blockchain enthusiasts to collaborate and learn together.",
      image: "https://i.ibb.co/YBvqHqsp/Screenshot-2025-06-24-030451.png",
      category: "Community",
      link: '/communities/kenya'
    },
    {
      id: 4,
      title: "SUI Community Nigeria",
      description: "Nigeria's largest blockchain community focused on SUI ecosystem development, education, and creating opportunities for local developers and entrepreneurs.",
      image: "https://i.ibb.co/W4zMd77q/Screenshot-2025-06-24-030948.png",
      category: "Community",
      link: '/communities/nigeria'
    },
    {
      id: 5,
      title: "SUI Gaming Africa",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/1fmbwkSM/Screenshot-2025-06-24-141856.png",
      category: "Development",
      link: '/communities/gaming-africa'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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
                href={item === "Home" ? "/landing" : `/${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>
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
                <div className="w-full h-full flex items-center justify-center relative">
                {/* Background image */}
                <Image 
                  src={event.image} 
                  alt={event.title} 
                  fill
                  className="object-cover"
                />
                  {/* Overlay content */}
              <div className="relative z-10 text-white text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                  {/* You can put an icon here or remove this div entirely */}
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

