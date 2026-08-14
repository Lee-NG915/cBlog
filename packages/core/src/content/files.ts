import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { assertWritablePath } from "../paths";

/** 原子写：临时文件 + rename（NFR-4），写前校验路径白名单 */
export function writeFileAtomic(absPath: string, content: string | Buffer): void {
  assertWritablePath(absPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  const tmpPath = `${absPath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmpPath, content);
  fs.renameSync(tmpPath, absPath);
}

/** 软删除：移动到 content/.trash/<时间戳>-<名称>/，保留文件可恢复（FR-3.6） */
export function moveToTrash(absPath: string, trashRoot: string): string {
  assertWritablePath(absPath);
  assertWritablePath(trashRoot);
  if (!fs.existsSync(absPath)) return absPath;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = path.join(trashRoot, `${stamp}-${path.basename(absPath)}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.renameSync(absPath, target);
  return target;
}

/** 规范化图片文件名：小写、空白转连字符，仅保留安全字符 */
export function normalizeAssetName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const stem = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9一-鿿-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${stem || "image"}${ext || ".png"}`;
}

/**
 * 保存图片到文档同目录 assets/（FR-6.1/6.2）。
 * 重名时追加内容 hash 短后缀，互不覆盖。返回相对文档的引用路径（./assets/<name>）。
 */
export function saveAssetFile(
  docDirAbs: string,
  originalName: string,
  data: Buffer
): { relativeSrc: string; absPath: string } {
  const assetsDir = path.join(docDirAbs, "assets");
  assertWritablePath(assetsDir);
  fs.mkdirSync(assetsDir, { recursive: true });

  let name = normalizeAssetName(originalName);
  let absPath = path.join(assetsDir, name);
  if (fs.existsSync(absPath)) {
    const hash = crypto.createHash("sha1").update(data).digest("hex").slice(0, 6);
    const ext = path.extname(name);
    name = `${path.basename(name, ext)}-${hash}${ext}`;
    absPath = path.join(assetsDir, name);
  }

  writeFileAtomic(absPath, data);
  return { relativeSrc: `./assets/${name}`, absPath };
}
