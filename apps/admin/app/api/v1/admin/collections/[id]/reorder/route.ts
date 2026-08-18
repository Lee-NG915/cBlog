import { NextRequest, NextResponse } from "next/server";
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
    if (!Array.isArray(body.orderedIds)) {
      throw new Error("orderedIds 必须是字符串数组");
    }
    const orderedIds = (body.orderedIds as unknown[]).map((value) =>
      String(value)
    );
    await contentService().reorderCollectionItems(params.id, orderedIds);
    return { ok: true };
  });
}
