/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivityPosition: 'bottom-right',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
