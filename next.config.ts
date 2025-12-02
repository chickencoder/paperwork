import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for react-pdf and pdf.js
  webpack: (config) => {
    // Disable canvas and encoding which aren't needed for PDF rendering in browser
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };
    return config;
  },

  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
