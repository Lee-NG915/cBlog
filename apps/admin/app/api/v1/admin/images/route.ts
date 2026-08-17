import { NextRequest, NextResponse } from "next/server";
import { handleV1, requireMutationContext } from "@/lib/api-guards";
import { contentService } from "@/lib/content-service";

export const dynamic = "force-dynamic";

/**
 * 图片上传（FR-6.1/6.2）：multipart(file, filePath?)
 * filePath 为 filesystem 模式的目标文档相对 content/ 路径；postgres 模式忽略。
 * 格式/大小校验由 ContentService.uploadAsset 内部完成。
 */
export async function POST(request: NextRequest) {
  const guard = await requireMutationContext(request);
  if (guard instanceof NextResponse) return guard;
  return handleV1(async () => {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("缺少图片文件");
    const filePath = String(formData.get("filePath") ?? "");

    const { src } = await contentService().uploadAsset({
      fileName: file.name || "image.png",
      bytes: Buffer.from(await file.arrayBuffer()),
      docFilePath: filePath || undefined,
    });
    return { src };
  });
}
