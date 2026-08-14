import { NextRequest } from "next/server";
import {
  countPostsByCategory,
  createCategory,
  listCategories,
} from "@cblog/core";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(() => {
    const counts = countPostsByCategory();
    return {
      categories: listCategories().map((category) => ({
        ...category,
        postCount: counts.get(category.id) ?? 0,
      })),
    };
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return handleApi(() => {
    const id = createCategory({
      slug: String(body.slug ?? ""),
      name: String(body.name ?? ""),
      description: body.description ? String(body.description) : "",
    });
    return { id };
  });
}
