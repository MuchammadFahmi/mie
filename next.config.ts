import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/assets/**",
        search: "",
      },
      {
        pathname: "/uploads/**",
        search: "",
      },
    ],
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
