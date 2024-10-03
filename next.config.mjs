/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    transpilePackages: ['@mantine/core', '@mantine/hooks', 'wavesurfer.js'],
  };
  
  export default nextConfig;
  