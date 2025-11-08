/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json'
  },
  experimental: {
    typedRoutes: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
