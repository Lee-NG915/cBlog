import { NextRequest, NextResponse } from "next/server";
import { handleV1, requireMutationContext } from "@/lib/api-guards";
import { contentService, postgresService } from "@/lib/content-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleV1(async () => {
    const detail = await contentService().getCollectionItem(params.id);
    const pg = postgresService();
    if (pg) {
      return {
        item: detail,
        assetUrlMap: await pg.assetUrlMapFor(detail.content),
      };
    }
    return { item: detail };
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
    await contentService().saveCollectionItem(params.id, {
      title: body.title,
      content: body.content,
      expectedVersion: body.expectedVersion,
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
    await contentService().deleteCollectionItem(params.id);
    return { ok: true };
  });
}
