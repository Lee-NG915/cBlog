import { NextRequest } from "next/server";
import {
  guardPublicApi,
  handleV1,
  publicJson,
  publicNotFound,
} from "@/lib/api-guards";
import { publicReader } from "@/lib/pg";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const guarded = guardPublicApi(request);
  if (guarded) return guarded;
  return handleV1(async () => {
    const post = await publicReader().getPost(decodeURIComponent(params.slug));
    if (!post) return publicNotFound("POST_NOT_FOUND");
    return publicJson({ post });
  });
}
