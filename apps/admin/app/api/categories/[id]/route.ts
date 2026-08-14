import { NextRequest } from "next/server";
import { deleteCategory, updateCategory } from "@cblog/core";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  return handleApi(() => {
    updateCategory(Number.parseInt(params.id, 10), {
      name: body.name,
      description: body.description,
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
    deleteCategory(Number.parseInt(params.id, 10));
    return { ok: true };
  });
}
