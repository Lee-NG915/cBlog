import { NextRequest } from "next/server";
import { createPost, listPostMetas } from "@cblog/core";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleApi(() => {
    const params = request.nextUrl.searchParams;
    const status = params.get("status");
    const category = params.get("category");
    const tag = params.get("tag");
    const keyword = params.get("q")?.trim().toLowerCase();

    let metas = listPostMetas();
    if (status) metas = metas.filter((meta) => meta.status === status);
    if (category) metas = metas.filter((meta) => meta.categorySlug === category);
    if (tag) metas = metas.filter((meta) => meta.tags.includes(tag));
    if (keyword)
      metas = metas.filter(
        (meta) =>
          meta.title.toLowerCase().includes(keyword) ||
          meta.slug.toLowerCase().includes(keyword)
      );
    return { posts: metas };
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return handleApi(() => {
    const id = createPost({
      title: String(body.title ?? ""),
      slug: String(body.slug ?? ""),
      categorySlug: String(body.categorySlug ?? ""),
    });
    return { id };
  });
}
