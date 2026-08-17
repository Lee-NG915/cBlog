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
    const { id } = await contentService().createCollectionItem(params.id, {
      title: String(body.title ?? ""),
      slug: String(body.slug ?? ""),
    });
    return { id };
  });
}
