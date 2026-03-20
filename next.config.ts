import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@mondaycom/sensei-engine', 'better-sqlite3'],
};

export default nextConfig;
