import { NextRequest } from "next/server";
import { createCollection, listCollectionItems, listCollections } from "@cblog/core";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(() => ({
    collections: listCollections().map((collection) => ({
      ...collection,
      itemCount: listCollectionItems(collection.slug).length,
    })),
  }));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return handleApi(() => {
    const id = createCollection({
      slug: String(body.slug ?? ""),
      name: String(body.name ?? ""),
      description: body.description ? String(body.description) : "",
      label: body.label ? String(body.label) : undefined,
      badge: body.badge ? String(body.badge) : undefined,
      noindex: body.noindex !== false,
    });
    return { id };
  });
}
