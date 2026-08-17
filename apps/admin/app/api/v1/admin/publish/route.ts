import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleV1, requireMutationContext } from "@/lib/api-guards";
import { contentService } from "@/lib/content-service";
import { gitPublishEnabled } from "@/lib/env";
import { publish } from "@/lib/git";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const guard = await requireMutationContext(request);
  if (guard instanceof NextResponse) return guard;
  return handleV1(async () => {
    if (!gitPublishEnabled() || contentService().mode !== "filesystem") {
      throw new ApiError(
        409,
        "GIT_PUBLISH_DISABLED",
        "Git 发布链路已停用（GIT_PUBLISH_ENABLED=false 或非 filesystem 模式）"
      );
    }
    const body = await request.json();
    return publish(String(body.message ?? ""));
  });
}
