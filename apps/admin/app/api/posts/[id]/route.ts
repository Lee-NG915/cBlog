import { NextRequest } from "next/server";
import {
  deletePost,
  getPostMetaById,
  readPostContent,
  savePost,
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
    const meta = getPostMetaById(parseId(params.id));
    if (!meta) throw new Error("文章不存在");
    return { post: { ...meta, content: readPostContent(meta.filePath) } };
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  return handleApi(() => {
    savePost(parseId(params.id), {
      title: body.title,
      date: body.date,
      updatedAt: body.updatedAt,
      excerpt: body.excerpt,
      tags: body.tags,
      coverImage: body.coverImage,
      categorySlug: body.categorySlug,
      content: body.content,
    });
    return { ok: true };
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(() => {
    deletePost(parseId(params.id));
    return { ok: true };
  });
}
