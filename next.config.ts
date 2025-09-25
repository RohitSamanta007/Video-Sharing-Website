import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL(
        "https://vidme-video-sharing-website-private.s3.ap-south-1.amazonaws.com"
      ),
    ],
    domains: [
      "vidme-video-sharing-website-private.s3.ap-south-1.amazonaws.com",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
