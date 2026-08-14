import { NextRequest } from "next/server";
import { reorderCollectionItems } from "@cblog/core";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  return handleApi(() => {
    const orderedIds = (body.orderedIds as unknown[]).map((value) =>
      Number.parseInt(String(value), 10)
    );
    reorderCollectionItems(Number.parseInt(params.id, 10), orderedIds);
    return { ok: true };
  });
}
