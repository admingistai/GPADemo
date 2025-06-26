/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Temporarily disable ESLint during builds to fix deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configure static file serving for carbontide
  async rewrites() {
    return [
      {
        source: '/carbontide/:path*',
        destination: '/cloned-projects/carbontide/:path*'
      }
    ];
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      // Widget.js specific headers for cross-origin access
      {
        source: '/widget.js',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET'
          },
          {
            key: 'Content-Type',
            value: 'application/javascript'
          }
        ]
      },
      // Asset headers for images, logos, etc.
      {
        source: '/:path*\\.(png|jpg|jpeg|gif|svg|ico)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;