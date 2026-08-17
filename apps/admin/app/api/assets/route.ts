import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { DocumentAssetError, resolveDocumentAssetPath } from "@cblog/core";

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

/** 编辑器预览用：只读取目标文档同级 assets/ 中的受支持图片。 */
export async function GET(request: NextRequest) {
  const doc = request.nextUrl.searchParams.get("doc") ?? "";
  const name = request.nextUrl.searchParams.get("name") ?? "";
  if (!doc || !name) {
    return NextResponse.json({ error: { message: "缺少参数" } }, { status: 400 });
  }

  try {
    const abs = resolveDocumentAssetPath(doc, name);
    const ext = path.extname(abs).toLowerCase();
    const mime = MIME[ext];
    if (!mime) {
      return NextResponse.json(
        { error: { message: "不支持的资产类型" } },
        { status: 415 }
      );
    }
    return new NextResponse(fs.readFileSync(abs), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, no-store",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (!(error instanceof DocumentAssetError)) {
      console.error("读取编辑器资产失败", error);
      return NextResponse.json(
        { error: { message: "资产读取失败" } },
        { status: 500 }
      );
    }

    const status = error.code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json(
      {
        error: {
          message: status === 404 ? "资产文件不存在" : "非法资产路径",
        },
      },
      { status }
    );
  }
}
