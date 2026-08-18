import { NextRequest, NextResponse } from "next/server";
import { POST_STATUSES, type PostStatus } from "@cblog/core";
import { handleV1, requireMutationContext } from "@/lib/api-guards";
import { contentService } from "@/lib/content-service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireMutationContext(request);
  if (guard instanceof NextResponse) return guard;
  return handleV1(async () => {
    const body = await request.json();
    const status = String(body.status) as PostStatus;
    if (!POST_STATUSES.includes(status)) {
      throw new Error(`非法状态: ${body.status}`);
    }
    await contentService().setPostStatus(
      params.id,
      status,
      body.expectedVersion
    );
    return { ok: true };
  });
}
