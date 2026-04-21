import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'aquadrop.hu'
          }
        ],
        destination: 'https://www.aquadrop.hu/:path*',
        permanent: true
      }
    ];
  }
};

export default nextConfig;
