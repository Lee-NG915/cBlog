import { getPublishStatus, suggestCommitMessage } from "@/lib/git";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(async () => {
    const status = await getPublishStatus();
    return {
      ...status,
      suggestedMessage: suggestCommitMessage(status.contentChanges),
    };
  });
}
