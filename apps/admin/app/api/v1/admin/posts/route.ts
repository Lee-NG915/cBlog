import { NextRequest, NextResponse } from "next/server";
import { handleV1, requireMutationContext } from "@/lib/api-guards";
import { contentService } from "@/lib/content-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleV1(async () => {
    const params = request.nextUrl.searchParams;
    const posts = await contentService().listPosts({
      status: params.get("status") ?? undefined,
      categorySlug: params.get("category") ?? undefined,
      tag: params.get("tag") ?? undefined,
      keyword: params.get("q")?.trim() || undefined,
    });
    return { posts };
  });
}

export async function POST(request: NextRequest) {
  const guard = await requireMutationContext(request);
  if (guard instanceof NextResponse) return guard;
  return handleV1(async () => {
    const body = await request.json();
    const { id } = await contentService().createPost({
      title: String(body.title ?? ""),
      slug: String(body.slug ?? ""),
      categorySlug: String(body.categorySlug ?? ""),
    });
    return { id };
  });
}
