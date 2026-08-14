import { NextRequest } from "next/server";
import {
  deleteCollection,
  listCollectionItems,
  listCollections,
  updateCollection,
} from "@cblog/core";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

function parseId(value: string): number {
  const id = Number.parseInt(value, 10);
  if (!Number.isFinite(id)) throw new Error(`非法 id: ${value}`);
  return id;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(() => {
    const id = parseId(params.id);
    const collection = listCollections().find((item) => item.id === id);
    if (!collection) throw new Error("专栏不存在");
    return {
      collection,
      items: listCollectionItems(collection.slug),
    };
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  return handleApi(() => {
    updateCollection(parseId(params.id), {
      name: body.name,
      description: body.description,
      label: body.label,
      badge: body.badge,
      noindex: body.noindex,
      sortOrder: body.sortOrder,
    });
    return { ok: true };
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(() => {
    deleteCollection(parseId(params.id));
    return { ok: true };
  });
}
