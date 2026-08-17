import { NextRequest } from "next/server";
import { guardPublicApi, handleV1, publicJson } from "@/lib/api-guards";
import { publicReader } from "@/lib/pg";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guarded = guardPublicApi(request);
  if (guarded) return guarded;
  return handleV1(async () =>
    publicJson({ categories: await publicReader().getCategories() })
  );
}
