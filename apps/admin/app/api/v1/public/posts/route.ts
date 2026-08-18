import { NextRequest } from "next/server";
import { guardPublicApi, handleV1, publicJson } from "@/lib/api-guards";
import { publicReader } from "@/lib/pg";

export const dynamic = "force-dynamic";

/** 已发布文章摘要；status 等绕过参数一律忽略（API-003） */
export async function GET(request: NextRequest) {
  const guarded = guardPublicApi(request);
  if (guarded) return guarded;
  return handleV1(async () => {
    const params = request.nextUrl.searchParams;
    const limitRaw = params.get("limit");
    const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;
    const posts = await publicReader().getPosts({
      categorySlug: params.get("category") ?? undefined,
      limit: Number.isFinite(limit) && limit! > 0 ? limit : undefined,
    });
    return publicJson({ posts });
  });
}
