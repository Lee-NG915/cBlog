/** @type {import('next').NextConfig} */
const nextConfig = {
  // 管理端仅本地 next dev 运行，永不部署（NFR-3）
  transpilePackages: ["@cblog/core"],
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3", "simple-git"],
  },
};

module.exports = nextConfig;
