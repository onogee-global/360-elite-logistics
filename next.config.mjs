/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/:slug([a-z0-9][a-z0-9-]*)",
        destination: "/products?category=:slug",
      },
    ]
  },
}

export default nextConfig
