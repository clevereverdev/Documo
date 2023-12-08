/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    output: 'standalone',
    images: {
        domains: ['firebasestorage.googleapis.com'],
        unoptimized: true,
    },
}

module.exports = nextConfig;
