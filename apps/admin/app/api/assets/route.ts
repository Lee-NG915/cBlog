import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { contentAbsPath, contentRoot } from "@cblog/core";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

/** 编辑器预览用：按文档 filePath + 相对名读取随文档图片（只读，严格限制在 content/ 内） */
export async function GET(request: NextRequest) {
  const doc = request.nextUrl.searchParams.get("doc") ?? "";
  const name = request.nextUrl.searchParams.get("name") ?? "";
  if (!doc || !name) {
    return NextResponse.json({ error: { message: "缺少参数" } }, { status: 400 });
  }

  const abs = path.resolve(path.dirname(contentAbsPath(doc)), name);
  if (!abs.startsWith(contentRoot() + path.sep)) {
    return NextResponse.json({ error: { message: "非法路径" } }, { status: 400 });
  }
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    return NextResponse.json({ error: { message: "文件不存在" } }, { status: 404 });
  }

  const ext = path.extname(abs).toLowerCase();
  return new NextResponse(fs.readFileSync(abs), {
    headers: { "Content-Type": MIME[ext] ?? "application/octet-stream" },
  });
}
