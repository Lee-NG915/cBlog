import { NextRequest, NextResponse } from "next/server";
import { handleV1, requireMutationContext } from "@/lib/api-guards";
import { contentService } from "@/lib/content-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleV1(async () => ({
    categories: await contentService().listCategories(),
  }));
}

export async function POST(request: NextRequest) {
  const guard = await requireMutationContext(request);
  if (guard instanceof NextResponse) return guard;
  return handleV1(async () => {
    const body = await request.json();
    const { id } = await contentService().createCategory({
      slug: String(body.slug ?? ""),
      name: String(body.name ?? ""),
      description: body.description ? String(body.description) : "",
    });
    return { id };
  });
}
