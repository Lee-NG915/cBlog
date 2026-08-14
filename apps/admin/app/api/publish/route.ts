import { NextRequest } from "next/server";
import { publish } from "@/lib/git";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  return handleApi(() => publish(String(body.message ?? "")));
}
