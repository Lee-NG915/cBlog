import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { remark } from "remark";
import type {
  MigrationAsset,
  RemoteAssetReference,
  UnresolvedAssetReference,
} from "./types";

interface MarkdownNode {
  type: string;
  url?: string;
  identifier?: string;
  children?: MarkdownNode[];
  position?: {
    start: { offset?: number };
    end: { offset?: number };
  };
}

interface Replacement {
  start: number;
  end: number;
  value: string;
}

export interface AssetScanContext {
  contentDir: string;
  publicDir: string;
  publicBaseUrl: string;
  assetsByHash: Map<string, MigrationAsset>;
  unresolved: UnresolvedAssetReference[];
  remote: RemoteAssetReference[];
}

export interface RewrittenMarkdown {
  markdown: string;
  localReferenceCount: number;
}

function sha256(input: Buffer | string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function assetIdFromSha256(hash: string): string {
  const value = hash.slice(0, 32);
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-5${value.slice(
    13,
    16
  )}-8${value.slice(17, 20)}-${value.slice(20, 32)}`;
}

function mimeTypeFor(fileName: string): string {
  switch (path.extname(fileName).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

function safeFileName(value: string): string {
  const cleaned = path
    .basename(value)
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "asset.bin";
}

function isRemoteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function withoutQueryOrHash(url: string): string {
  return url.split(/[?#]/, 1)[0];
}

function inside(root: string, candidate: string): boolean {
  return candidate === root || candidate.startsWith(root + path.sep);
}

function resolveLocalAsset(
  documentPath: string,
  url: string,
  context: AssetScanContext
): { absolutePath: string; logicalPath: string } | null {
  const cleanUrl = withoutQueryOrHash(url);
  const contentRoot = path.resolve(context.contentDir);
  const publicRoot = path.resolve(context.publicDir);

  let absolutePath: string;
  let allowedRoot: string;
  let logicalPath: string;
  if (cleanUrl.startsWith("/images/")) {
    allowedRoot = path.join(publicRoot, "images");
    absolutePath = path.resolve(publicRoot, `.${cleanUrl}`);
    logicalPath = `public${cleanUrl}`;
  } else if (
    cleanUrl.startsWith("./assets/") ||
    cleanUrl.startsWith("assets/")
  ) {
    const documentAbsolutePath = path.resolve(contentRoot, documentPath);
    allowedRoot = path.resolve(path.dirname(documentAbsolutePath), "assets");
    absolutePath = path.resolve(path.dirname(documentAbsolutePath), cleanUrl);
    logicalPath = path
      .relative(contentRoot, absolutePath)
      .split(path.sep)
      .join("/");
  } else {
    return null;
  }

  if (!inside(allowedRoot, absolutePath) || !fs.existsSync(absolutePath)) {
    return null;
  }
  const realAllowedRoot = fs.realpathSync(allowedRoot);
  const realPath = fs.realpathSync(absolutePath);
  if (!inside(realAllowedRoot, realPath) || !fs.statSync(realPath).isFile()) {
    return null;
  }
  return { absolutePath: realPath, logicalPath };
}

function registerLocalAsset(
  documentPath: string,
  url: string,
  context: AssetScanContext
): MigrationAsset | null {
  const resolved = resolveLocalAsset(documentPath, url, context);
  if (!resolved) {
    context.unresolved.push({
      documentPath,
      url,
      reason: "本地资产不存在、越界或不是受支持的 ./assets/、/images/ 引用",
    });
    return null;
  }

  const bytes = fs.readFileSync(resolved.absolutePath);
  const hash = sha256(bytes);
  const existing = context.assetsByHash.get(hash);
  if (existing) {
    existing.referenceCount += 1;
    return existing;
  }

  const originalName = safeFileName(resolved.absolutePath);
  const objectKey = `${hash.slice(0, 2)}/${hash}-${originalName}`;
  const publicUrl = `${context.publicBaseUrl.replace(/\/$/, "")}/${objectKey}`;
  const asset: MigrationAsset = {
    id: assetIdFromSha256(hash),
    objectKey,
    originalName,
    mimeType: mimeTypeFor(originalName),
    byteSize: bytes.byteLength,
    sha256: hash,
    sourcePath: resolved.logicalPath,
    publicUrl,
    referenceCount: 1,
  };
  context.assetsByHash.set(hash, asset);
  return asset;
}

function collectNodes(root: MarkdownNode): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  const visit = (node: MarkdownNode) => {
    nodes.push(node);
    node.children?.forEach(visit);
  };
  visit(root);
  return nodes;
}

function replacementForNode(
  markdown: string,
  node: MarkdownNode,
  oldUrl: string,
  newUrl: string
): Replacement | null {
  const nodeStart = node.position?.start.offset;
  const nodeEnd = node.position?.end.offset;
  if (nodeStart === undefined || nodeEnd === undefined) return null;
  const fragment = markdown.slice(nodeStart, nodeEnd);
  const destinationMarker =
    node.type === "definition"
      ? fragment.indexOf("]:") + 2
      : fragment.lastIndexOf("](") + 2;
  const relativeStart = fragment.indexOf(oldUrl, Math.max(destinationMarker, 0));
  if (relativeStart < 0) return null;
  return {
    start: nodeStart + relativeStart,
    end: nodeStart + relativeStart + oldUrl.length,
    value: newUrl,
  };
}

export function rewriteMarkdownAssets(
  documentPath: string,
  markdown: string,
  context: AssetScanContext
): RewrittenMarkdown {
  const tree = remark().parse(markdown) as unknown as MarkdownNode;
  const nodes = collectNodes(tree);
  const imageReferenceIds = new Set(
    nodes
      .filter((node) => node.type === "imageReference" && node.identifier)
      .map((node) => node.identifier!.toLowerCase())
  );
  const linkReferenceIds = new Set(
    nodes
      .filter((node) => node.type === "linkReference" && node.identifier)
      .map((node) => node.identifier!.toLowerCase())
  );
  const candidates = nodes.filter(
    (node) =>
      node.type === "image" ||
      (node.type === "definition" &&
        node.identifier &&
        imageReferenceIds.has(node.identifier.toLowerCase()))
  );

  for (const node of nodes) {
    if (
      node.type === "link" &&
      node.url &&
      !isRemoteUrl(node.url) &&
      !node.url.startsWith("asset://") &&
      (node.url.startsWith("./assets/") ||
        node.url.startsWith("assets/") ||
        node.url.startsWith("/images/"))
    ) {
      context.unresolved.push({
        documentPath,
        url: node.url,
        reason: "普通链接引用本地资产，需在迁移前明确下载/附件语义",
      });
    }
    // linkReference 的 definition 指向本地资产：显式进 unresolved 阻断 apply（与 image 共用的
    // definition 仍会按图片语义改写，但 unresolved 非空即拒绝，不会静默残留）
    if (
      node.type === "definition" &&
      node.identifier &&
      node.url &&
      linkReferenceIds.has(node.identifier.toLowerCase()) &&
      !isRemoteUrl(node.url) &&
      !node.url.startsWith("asset://") &&
      (node.url.startsWith("./assets/") ||
        node.url.startsWith("assets/") ||
        node.url.startsWith("/images/"))
    ) {
      context.unresolved.push({
        documentPath,
        url: node.url,
        reason: "linkReference 定义引用本地资产，需在迁移前明确下载/附件语义",
      });
    }
    if (
      node.type === "html" &&
      node.position?.start.offset !== undefined &&
      node.position.end.offset !== undefined
    ) {
      const html = markdown.slice(
        node.position.start.offset,
        node.position.end.offset
      );
      const localUrls = html.match(/(?:\.\/assets\/|\/images\/)[^"'\s>]+/g) ?? [];
      for (const url of localUrls) {
        context.unresolved.push({
          documentPath,
          url,
          reason: "HTML 中的本地资产引用无法安全 AST 改写",
        });
      }
    }
  }

  const replacements: Replacement[] = [];
  let localReferenceCount = 0;
  for (const node of candidates) {
    const url = node.url;
    if (!url || url.startsWith("asset://") || url.startsWith("data:")) continue;
    if (isRemoteUrl(url)) {
      context.remote.push({ documentPath, url, kind: "markdown" });
      continue;
    }
    const asset = registerLocalAsset(documentPath, url, context);
    if (!asset) continue;
    const replacement = replacementForNode(
      markdown,
      node,
      url,
      `asset://${asset.id}`
    );
    if (!replacement) {
      context.unresolved.push({
        documentPath,
        url,
        reason: "Markdown AST 已识别图片，但无法定位 URL 字节范围",
      });
      continue;
    }
    replacements.push(replacement);
    localReferenceCount += 1;
  }

  let rewritten = markdown;
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
    rewritten =
      rewritten.slice(0, replacement.start) +
      replacement.value +
      rewritten.slice(replacement.end);
  }
  return { markdown: rewritten, localReferenceCount };
}

export function resolveCoverAsset(
  documentPath: string,
  coverUrl: string | null,
  context: AssetScanContext
): { assetId: string | null; externalUrl: string | null } {
  if (!coverUrl) return { assetId: null, externalUrl: null };
  if (isRemoteUrl(coverUrl)) {
    context.remote.push({ documentPath, url: coverUrl, kind: "cover" });
    return { assetId: null, externalUrl: coverUrl };
  }
  const asset = registerLocalAsset(documentPath, coverUrl, context);
  return { assetId: asset?.id ?? null, externalUrl: null };
}

export interface MigrationAssetStore {
  put(asset: MigrationAsset): Promise<void>;
  read(objectKey: string): Promise<Buffer>;
}

export interface MigrationAssetSourceRoots {
  contentDir: string;
  publicDir: string;
}

function readMigrationAssetSource(
  asset: MigrationAsset,
  sourceRoots: MigrationAssetSourceRoots
): Buffer {
  const sourceRoot = path.resolve(
    asset.sourcePath.startsWith("public/")
      ? sourceRoots.publicDir
      : sourceRoots.contentDir
  );
  const sourceRelativePath = asset.sourcePath.startsWith("public/")
    ? asset.sourcePath.slice("public/".length)
    : asset.sourcePath;
  const sourcePath = path.resolve(sourceRoot, sourceRelativePath);
  if (!inside(sourceRoot, sourcePath)) throw new Error("资产源路径越界");
  const realSourceRoot = fs.realpathSync(sourceRoot);
  const realSourcePath = fs.realpathSync(sourcePath);
  if (
    realSourcePath !== realSourceRoot &&
    !inside(realSourceRoot, realSourcePath)
  ) {
    throw new Error("资产源真实路径越界");
  }
  const body = fs.readFileSync(realSourcePath);
  if (sha256(body) !== asset.sha256) {
    throw new Error(`资产源 hash 校验失败: ${asset.sourcePath}`);
  }
  return body;
}

function assertSafeObjectKey(objectKey: string): void {
  if (
    !objectKey ||
    objectKey.startsWith("/") ||
    objectKey.includes("\\") ||
    objectKey.split("/").includes("..")
  ) {
    throw new Error("资产 object key 越界");
  }
}

/** Phase 2/staging 的本地可恢复对象存储实现。 */
export class FileSystemMigrationAssetStore implements MigrationAssetStore {
  constructor(
    private readonly rootDir: string,
    private readonly sourceRoots: MigrationAssetSourceRoots
  ) {}

  async put(asset: MigrationAsset): Promise<void> {
    const body = readMigrationAssetSource(asset, this.sourceRoots);
    const destination = path.resolve(this.rootDir, asset.objectKey);
    const root = path.resolve(this.rootDir);
    if (!inside(root, destination)) throw new Error("资产 object key 越界");
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (!fs.existsSync(destination)) fs.writeFileSync(destination, body);
    const storedHash = sha256(fs.readFileSync(destination));
    if (storedHash !== asset.sha256) {
      throw new Error(`对象 hash 校验失败: ${asset.objectKey}`);
    }
  }

  async read(objectKey: string): Promise<Buffer> {
    const root = path.resolve(this.rootDir);
    const source = path.resolve(root, objectKey);
    if (!inside(root, source)) throw new Error("资产 object key 越界");
    return fs.promises.readFile(source);
  }
}

interface S3CommandSender {
  send(command: GetObjectCommand | PutObjectCommand): Promise<unknown>;
}

export interface S3MigrationAssetStoreConfig
  extends MigrationAssetSourceRoots {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
  client?: S3CommandSender;
}

export function resolveS3ForcePathStyle(
  endpoint: string | undefined,
  configured: boolean | undefined
): boolean {
  return configured ?? Boolean(endpoint);
}

async function objectBodyToBuffer(body: unknown): Promise<Buffer> {
  if (!body) throw new Error("S3 对象响应缺少 body");
  if (
    typeof body === "object" &&
    "transformToByteArray" in body &&
    typeof body.transformToByteArray === "function"
  ) {
    return Buffer.from(await body.transformToByteArray());
  }
  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function isMissingObject(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const value = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return (
    value.name === "NoSuchKey" ||
    value.name === "NotFound" ||
    value.$metadata?.httpStatusCode === 404
  );
}

/**
 * Phase 7 生产迁移对象存储：直接写入 S3 compatible bucket，并在上传后重新读取
 * 校验 SHA-256。object key 由内容 hash 生成，因此同一迁移可安全幂等重放。
 */
export class S3MigrationAssetStore implements MigrationAssetStore {
  private readonly client: S3CommandSender;

  constructor(private readonly config: S3MigrationAssetStoreConfig) {
    if (!config.bucket.trim()) throw new Error("S3 migration bucket 不能为空");
    this.client =
      config.client ??
      new S3Client({
        region: config.region,
        endpoint: config.endpoint,
        forcePathStyle: resolveS3ForcePathStyle(
          config.endpoint,
          config.forcePathStyle
        ),
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      } satisfies S3ClientConfig);
  }

  async put(asset: MigrationAsset): Promise<void> {
    assertSafeObjectKey(asset.objectKey);
    const body = readMigrationAssetSource(asset, this.config);
    try {
      const existing = await this.read(asset.objectKey);
      if (sha256(existing) === asset.sha256) return;
    } catch (error) {
      if (!isMissingObject(error)) throw error;
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: asset.objectKey,
        Body: body,
        ContentType: asset.mimeType,
        Metadata: { sha256: asset.sha256 },
      })
    );
    const stored = await this.read(asset.objectKey);
    if (sha256(stored) !== asset.sha256) {
      throw new Error(`S3 对象 hash 校验失败: ${asset.objectKey}`);
    }
  }

  async read(objectKey: string): Promise<Buffer> {
    assertSafeObjectKey(objectKey);
    const response = (await this.client.send(
      new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: objectKey,
      })
    )) as { Body?: unknown };
    return objectBodyToBuffer(response.Body);
  }
}
