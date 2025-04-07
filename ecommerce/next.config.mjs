/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Dangerously allow builds with warning or errors
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Enable app directory with routing
    appDir: true,
  }
};

export default nextConfig; 