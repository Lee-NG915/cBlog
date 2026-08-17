import { ApiError, handleV1 } from "@/lib/api-guards";
import { contentService } from "@/lib/content-service";
import { gitPublishEnabled } from "@/lib/env";
import { getPublishStatus, suggestCommitMessage } from "@/lib/git";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleV1(async () => {
    if (!gitPublishEnabled() || contentService().mode !== "filesystem") {
      throw new ApiError(
        409,
        "GIT_PUBLISH_DISABLED",
        "Git 发布链路已停用（GIT_PUBLISH_ENABLED=false 或非 filesystem 模式）"
      );
    }
    const status = await getPublishStatus();
    return {
      ...status,
      suggestedMessage: suggestCommitMessage(status.contentChanges),
    };
  });
}
