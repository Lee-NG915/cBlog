import { NextRequest, NextResponse } from "next/server";
import { handleV1, requireMutationContext } from "@/lib/api-guards";
import { contentService } from "@/lib/content-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleV1(async () => ({
    collections: await contentService().listCollections(),
  }));
}

export async function POST(request: NextRequest) {
  const guard = await requireMutationContext(request);
  if (guard instanceof NextResponse) return guard;
  return handleV1(async () => {
    const body = await request.json();
    const { id } = await contentService().createCollection({
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
