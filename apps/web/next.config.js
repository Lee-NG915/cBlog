/** @type {import('next').NextConfig} */
const RENDER_MODES = ["static-export", "runtime-isr"];
const PUBLICATION_DRIVERS = [
  "github-dispatch",
  "generic-build-hook",
  "revalidation-webhook",
];

/**
 * STATIC-008 组合校验（部署态 v2 Phase 5）：渲染 profile 与发布驱动必须匹配——
 * static-export 只允许 github-dispatch / generic-build-hook（构建即发布）；
 * runtime-isr 只允许 revalidation-webhook（运行时事件失效）。
 * 无效组合直接 throw，让 next build 立即失败。导出以便测试。
 */
function validateRenderProfile(renderMode, publicationDriver) {
  if (!RENDER_MODES.includes(renderMode)) {
    throw new Error(
      `[next.config] 无效 WEB_RENDER_MODE="${renderMode}"，仅接受：${RENDER_MODES.join(
        " | "
      )}`
    );
  }
  if (!PUBLICATION_DRIVERS.includes(publicationDriver)) {
    throw new Error(
      `[next.config] 无效 PUBLICATION_DRIVER="${publicationDriver}"，仅接受：${PUBLICATION_DRIVERS.join(
        " | "
      )}`
    );
  }
  const allowedDrivers =
    renderMode === "static-export"
      ? ["github-dispatch", "generic-build-hook"]
      : ["revalidation-webhook"];
  if (!allowedDrivers.includes(publicationDriver)) {
    throw new Error(
      `[next.config] 非法组合（STATIC-008）：WEB_RENDER_MODE=${renderMode} 只允许 PUBLICATION_DRIVER=${allowedDrivers.join(
        " | "
      )}，当前为 ${publicationDriver}`
    );
  }
  return { renderMode, publicationDriver };
}

function validateRuntimeTopology(renderMode, replicasValue) {
  if (renderMode !== "runtime-isr") return;
  if (!replicasValue) {
    throw new Error(
      "[next.config] runtime-isr 必须显式设置 WEB_RUNTIME_REPLICAS=1"
    );
  }
  const replicas = Number(replicasValue);
  if (!Number.isInteger(replicas) || replicas < 1) {
    throw new Error("[next.config] WEB_RUNTIME_REPLICAS 必须是正整数");
  }
  if (replicas > 1) {
    throw new Error(
      "[next.config] 当前未实现共享 Cache Handler，runtime-isr 仅允许 WEB_RUNTIME_REPLICAS=1"
    );
  }
}

const renderMode = process.env.WEB_RENDER_MODE || "static-export";
const publicationDriver = process.env.PUBLICATION_DRIVER || "github-dispatch";
validateRenderProfile(renderMode, publicationDriver);
validateRuntimeTopology(
  renderMode,
  process.env.WEB_RUNTIME_REPLICAS
);

const isProd = process.env.NODE_ENV === "production";
const isApiSource = process.env.WEB_CONTENT_SOURCE === "api";
const isRuntimeIsr = renderMode === "runtime-isr";
// static-export 维持现状：生产按 BASE_PATH 挂子路径；dev 不挂。
// runtime-isr 自托管根路径：不继承 BASE_PATH。
const basePath = isRuntimeIsr ? "" : isProd ? process.env.BASE_PATH || "" : "";

const nextConfig = {
  // runtime-isr 不设 output（Node 运行时 + ISR）；static-export 维持 output:"export"
  ...(isRuntimeIsr ? {} : { output: "export" }),
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

// 以函数形式导出配置，把 validateRenderProfile 挂在函数上——
// 避免给 config 对象增加未识别键（Next 会警告 unrecognized key）。
const configFactory = () => nextConfig;
configFactory.validateRenderProfile = validateRenderProfile;
configFactory.validateRuntimeTopology = validateRuntimeTopology;
module.exports = configFactory;
