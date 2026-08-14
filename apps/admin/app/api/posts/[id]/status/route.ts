import { NextRequest } from "next/server";
import { POST_STATUSES, setPostStatus, type PostStatus } from "@cblog/core";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  return handleApi(() => {
    const id = Number.parseInt(params.id, 10);
    const status = String(body.status) as PostStatus;
    if (!POST_STATUSES.includes(status)) {
      throw new Error(`非法状态: ${body.status}`);
    }
    setPostStatus(id, status);
    return { ok: true };
  });
}
