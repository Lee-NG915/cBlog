import path from "node:path";
import { NextRequest } from "next/server";
import { contentAbsPath, saveAssetFile } from "@cblog/core";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);

/**
 * 图片上传（FR-6.1/6.2）：multipart(file, filePath)
 * filePath 为目标文档相对 content/ 的路径，图片落盘到该文档同目录 assets/。
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  return handleApi(async () => {
    const file = formData.get("file");
    const docFilePath = String(formData.get("filePath") ?? "");
    if (!(file instanceof File)) throw new Error("缺少图片文件");
    if (!docFilePath) throw new Error("缺少目标文档 filePath");

    const ext = path.extname(file.name || "image.png").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) throw new Error(`不支持的图片格式: ${ext}`);

    const docDir = path.dirname(contentAbsPath(docFilePath));
    const buffer = Buffer.from(await file.arrayBuffer());
    const { relativeSrc } = saveAssetFile(docDir, file.name || "image.png", buffer);
    return { src: relativeSrc };
  });
}
