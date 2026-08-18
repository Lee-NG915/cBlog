import { createHash } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { objectStorageConfig } from "@/lib/env";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * 允许的位图类型与 magic bytes（SEC-005）。
 * PostgreSQL 模式拒绝 SVG（主动内容风险，§11.5）；本地 filesystem 模式沿用既有行为。
 */
const MAGIC_CHECKS: Array<{
  mime: string;
  extension: string;
  matches: (bytes: Buffer) => boolean;
}> = [
  {
    mime: "image/png",
    extension: ".png",
    matches: (bytes) =>
      bytes.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
  },
  {
    mime: "image/jpeg",
    extension: ".jpg",
    matches: (bytes) =>
      bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  },
  {
    mime: "image/gif",
    extension: ".gif",
    matches: (bytes) => bytes.subarray(0, 4).toString("ascii") === "GIF8",
  },
  {
    mime: "image/webp",
    extension: ".webp",
    matches: (bytes) =>
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP",
  },
  {
    mime: "image/avif",
    extension: ".avif",
    matches: (bytes) =>
      bytes.subarray(4, 8).toString("ascii") === "ftyp" &&
      ["avif", "avis"].includes(bytes.subarray(8, 12).toString("ascii")),
  },
];

export interface ValidatedUpload {
  bytes: Buffer;
  mime: string;
  extension: string;
  sha256: string;
}

/** magic bytes + 大小校验；声明的 MIME/扩展名不可信，以内容判定为准 */
export function validateUploadBytes(bytes: Buffer): ValidatedUpload {
  if (bytes.byteLength === 0) throw new Error("空文件");
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error(`文件超过大小上限 ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`);
  }
  const matched = MAGIC_CHECKS.find((check) => check.matches(bytes));
  if (!matched) {
    throw new Error("不支持的图片格式（仅 PNG/JPEG/GIF/WebP/AVIF）");
  }
  return {
    bytes,
    mime: matched.mime,
    extension: matched.extension,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

let cachedClient: S3Client | null = null;

function s3Client(): S3Client {
  if (cachedClient) return cachedClient;
  const config = objectStorageConfig();
  cachedClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return cachedClient;
}

/** object key 由服务端按内容 hash 生成（§6.3），不接受调用方路径 */
export function objectKeyFor(upload: ValidatedUpload): string {
  return `assets/${upload.sha256.slice(0, 2)}/${upload.sha256}${upload.extension}`;
}

export function publicUrlFor(objectKey: string): string {
  return `${objectStorageConfig().publicBaseUrl}/${objectKey}`;
}

export async function putObject(upload: ValidatedUpload): Promise<{
  objectKey: string;
  publicUrl: string;
}> {
  const objectKey = objectKeyFor(upload);
  await s3Client().send(
    new PutObjectCommand({
      Bucket: objectStorageConfig().bucket,
      Key: objectKey,
      Body: upload.bytes,
      ContentType: upload.mime,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return { objectKey, publicUrl: publicUrlFor(objectKey) };
}
