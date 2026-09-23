import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { Bindings } from "./types";
export async function hash(value: string | ArrayBuffer) {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : value;
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export function cookieName(c: Context<{ Bindings: Bindings }>) {
  return new URL(c.req.url).protocol === "https:"
    ? "__Host-cblog_session"
    : "cblog_local_session";
}
export async function session(c: Context<{ Bindings: Bindings }>) {
  const token = getCookie(c, cookieName(c));
  if (!token) return null;
  return c.env.DB.prepare(
    "SELECT csrf FROM sessions WHERE token_hash=? AND expires_at>?",
  )
    .bind(await hash(token), new Date().toISOString())
    .first<{ csrf: string }>();
}
export async function issueSession(c: Context<{ Bindings: Bindings }>) {
  const token = crypto.randomUUID() + crypto.randomUUID(),
    csrf = crypto.randomUUID();
  await c.env.DB.prepare("INSERT INTO sessions VALUES(?,?,?)")
    .bind(
      await hash(token),
      csrf,
      new Date(Date.now() + 7 * 86400000).toISOString(),
    )
    .run();
  setCookie(c, cookieName(c), token, {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === "https:",
    sameSite: "Lax",
    path: "/",
    maxAge: 604800,
  });
  return csrf;
}
export async function limitedBody(request: Request, max: number) {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  let length = 0;
  const parts: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > max) {
      await reader.cancel();
      throw new Error("BODY_TOO_LARGE");
    }
    parts.push(value);
  }
  const out = new Uint8Array(length);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}
