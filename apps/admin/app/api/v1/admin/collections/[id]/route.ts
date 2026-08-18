import { NextRequest, NextResponse } from "next/server";
import { handleV1, requireMutationContext } from "@/lib/api-guards";
import { contentService } from "@/lib/content-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleV1(async () => {
    const { collection, items } = await contentService().getCollection(
      params.id
    );
    return { collection, items };
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireMutationContext(request);
  if (guard instanceof NextResponse) return guard;
  return handleV1(async () => {
    const body = await request.json();
    await contentService().updateCollection(params.id, {
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireMutationContext(request);
  if (guard instanceof NextResponse) return guard;
  return handleV1(async () => {
    await contentService().deleteCollection(params.id);
    return { ok: true };
  });
}
