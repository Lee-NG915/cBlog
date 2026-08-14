import { NextResponse } from "next/server";

/** API 路由统一错误封装：业务错误以 400 + { error: { message } } 返回 */
export async function handleApi<T>(
  fn: () => T | Promise<T>
): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json(data ?? { ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
