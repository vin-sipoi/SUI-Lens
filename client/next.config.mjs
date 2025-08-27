/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Run on port 3001 to avoid conflicts
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

export default nextConfig
