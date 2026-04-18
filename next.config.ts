import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  watchOptions: {
    ignored: ["**/test-ledger/**", "**/.git/**", "**/node_modules/**"],
  },
};

export default nextConfig;
