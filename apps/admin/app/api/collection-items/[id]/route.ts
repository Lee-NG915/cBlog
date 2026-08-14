import { NextRequest } from "next/server";
import {
  deleteCollectionItem,
  getCollectionItemById,
  readPostContent,
  saveCollectionItem,
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
    const item = getCollectionItemById(parseId(params.id));
    if (!item) throw new Error("专栏文档不存在");
    return { item: { ...item, content: readPostContent(item.filePath) } };
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  return handleApi(() => {
    saveCollectionItem(parseId(params.id), {
      title: body.title,
      content: body.content,
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
    deleteCollectionItem(parseId(params.id));
    return { ok: true };
  });
}
