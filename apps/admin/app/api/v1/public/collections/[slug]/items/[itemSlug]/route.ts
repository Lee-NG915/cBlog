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
  { params }: { params: { slug: string; itemSlug: string } }
) {
  const guarded = guardPublicApi(request);
  if (guarded) return guarded;
  return handleV1(async () => {
    const item = await publicReader().getCollectionItem(
      decodeURIComponent(params.slug),
      decodeURIComponent(params.itemSlug)
    );
    if (!item) return publicNotFound("COLLECTION_ITEM_NOT_FOUND");
    return publicJson({ item });
  });
}
