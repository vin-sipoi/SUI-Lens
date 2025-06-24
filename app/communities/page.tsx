import Image from 'next/image'
import Link from 'next/link'

const CommunityDashboard: React.FC = () => {
  const communities = [
    {
      title: 'Sui Community Meetup',
      location: 'Nairobi, Kenya',
      image: 'https://via.placeholder.com/300x200?text=Sui+Community+Meetup+Nairobi',
      members: '1,528.77k x 6 Hug',
    },
    {
      title: 'Sui Community Meetup',
      location: 'Ghana',
      image: 'https://via.placeholder.com/300x200?text=Sui+Community+Meetup+Ghana',
      members: '',
    },
    {
      title: 'Sui Community Meetup',
      location: 'Nairobi, Kenya',
      image: 'https://i.ibb.co/mrLgZcFz/Whats-App-Image-2025-04-27-at-2-43-18-PM.jpg',
      members: '1,528.77k x 6 Hug',
    },
    {
      title: 'Sui Community Meetup',
      location: 'Mombasa',
      image: 'https://via.placeholder.com/300x200?text=Sui+Community+Meetup+Mombasa',
      members: '',
    },
    {
      title: 'Sui Community',
      location: 'Nairobi',
      image: 'https://via.placeholder.com/300x200?text=Sui+Community+Nairobi',
      members: '',
    },
    {
      title: 'Sui Community',
      location: 'Nairobi',
      image: 'https://via.placeholder.com/300x200?text=Sui+Community+Nairobi',
      members: '',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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

      {/* Community Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {communities.map((community, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={community.image} alt={community.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold">{community.title}</h3>
              <p className="text-sm text-gray-600">{community.location}</p>
              {community.members && (
                <p className="text-sm text-blue-600 font-semibold mt-2">{community.members}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityDashboard;
