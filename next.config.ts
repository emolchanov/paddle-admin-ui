import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  transpilePackages: [
    "@mui/material",
    "@mui/system",
    "@emotion/react",
    "@emotion/styled",
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    config.externals.push({
      "better-sqlite3": "commonjs better-sqlite3",
    });
    return config;
  },
};

export default nextConfig;
