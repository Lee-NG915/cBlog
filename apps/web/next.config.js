/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? process.env.BASE_PATH || "" : "";
const isApiSource = process.env.WEB_CONTENT_SOURCE === "api";

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: basePath,
  assetPrefix: basePath,
  transpilePackages: ["@cblog/core"],
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
  // WEB-202：api 影子构建把 lib/content/filesystem 替换为抛错 stub，
  // bundle 完全不包含 filesystem 模块图（better-sqlite3 / content/*.md 读取）
  webpack(config, { webpack }) {
    if (isApiSource) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^\.\/filesystem$/,
          (resource) => {
            if (/lib[\\/]content$/.test(resource.context)) {
              resource.request = "./filesystem.stub";
            }
          }
        )
      );
    }
    return config;
  },
};

module.exports = nextConfig;
