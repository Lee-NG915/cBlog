import { buildSnapshot } from "./snapshot-build.mjs";
const {
  KNOWLEDGE_API_ORIGIN,
  BUILD_PIPELINE_SECRET,
  GITHUB_RUN_ID,
  BUILD_JOB_ID,
  PUBLIC_SITE_URL,
} = process.env;
if (
  !/^[a-f0-9-]{36}$/.test(BUILD_JOB_ID || "") ||
  !/^\d+$/.test(GITHUB_RUN_ID || "") ||
  !BUILD_PIPELINE_SECRET
)
  throw new Error("Missing build identity/secret");
const origin = new URL(KNOWLEDGE_API_ORIGIN);
if (
  origin.protocol !== "https:" ||
  origin.username ||
  origin.password ||
  origin.pathname !== "/"
)
  throw new Error("API origin must be HTTPS without path");
async function call(suffix, body) {
  const r = await fetch(
    `${origin.origin}/internal/builds/${BUILD_JOB_ID}/${suffix}`,
    {
      method: body ? "POST" : "GET",
      redirect: "error",
      headers: {
        Authorization: `Bearer ${BUILD_PIPELINE_SECRET}`,
        "X-Build-Run": GITHUB_RUN_ID,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!r.ok)
    throw new Error(
      `Build endpoint ${suffix.split("/")[0]} returned HTTP ${r.status}`,
    );
  return r;
}
async function bytes(r, max) {
  const reader = r.body.getReader();
  let size = 0;
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new Error("Build response too large");
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}
const command = process.argv[2];
if (command === "claim") await call("claim", { runId: GITHUB_RUN_ID });
else if (command === "build") {
  const snapshot = JSON.parse(
    (await bytes(await call("snapshot"), 4 * 1024 * 1024)).toString(),
  );
  if (snapshot.jobId !== BUILD_JOB_ID) throw new Error("Wrong snapshot job");
  const site = new URL(PUBLIC_SITE_URL);
  if (site.protocol !== "https:") throw new Error("Public URL must be HTTPS");
  await buildSnapshot(snapshot, {
    basePath: site.pathname.replace(/\/$/, ""),
    siteUrl: PUBLIC_SITE_URL,
    assetLoader: async (id) => bytes(await call(`assets/${id}`), 1024 * 1024),
  });
} else if (["deploying", "failed", "succeeded"].includes(command)) {
  // Propagation delay or a transient callback failure must not become false success.
  let last;
  for (let i = 0; i < (command === "succeeded" ? 6 : 3); i++) {
    try {
      await call("status", { status: command });
      last = null;
      break;
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  if (last) throw last;
} else throw new Error("Unknown pipeline command");
