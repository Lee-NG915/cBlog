import { NextRequest } from "next/server";
import { createCollectionItem } from "@cblog/core";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  return handleApi(() => {
    const id = createCollectionItem({
      collectionId: Number.parseInt(params.id, 10),
      title: String(body.title ?? ""),
      slug: String(body.slug ?? ""),
    });
    return { id };
  });
}
