#!/usr/bin/env node
// Provision a draft-only credential. The server stores only its SHA-256 digest.
import { randomBytes, createHash } from "node:crypto";
import { mkdirSync, openSync, closeSync, writeFileSync, readFileSync, lstatSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("Usage: node scripts/knowledge/provision-draft-api.mjs [--token-file PATH]\nCreates or reuses a local 0600 token, then sets DRAFT_API_TOKEN_SHA256 on the configured cBlog Worker. Does not print the token or rotate existing credentials.");
  process.exit(0);
}
if (args.length && !(args.length === 2 && args[0] === "--token-file" && args[1])) {
  console.error("Invalid arguments; use --help.");
  process.exit(2);
}
const tokenFile = path.resolve(args[1] || path.join(homedir(), ".config/cblog/draft-api-token"));
const directory = path.dirname(tokenFile);
const cwd = fileURLToPath(new URL("../../apps/api/", import.meta.url));
if (!existsSync(tokenFile)) {
  const listing = spawnSync("pnpm", ["exec", "wrangler", "secret", "list"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  let secrets;
  try { secrets = JSON.parse(listing.stdout); } catch { /* Fail closed if authentication or output is unexpected. */ }
  if (listing.status !== 0 || !Array.isArray(secrets)) throw new Error("Could not verify existing Worker secrets; no local credential was created.");
  if (secrets.some((entry) => entry.name === "DRAFT_API_TOKEN_SHA256"))
    throw new Error("Worker already has a draft credential. Restore its local token file; explicit rotation is a separate operation.");
}
mkdirSync(directory, { recursive: true, mode: 0o700 });
let token;
if (existsSync(tokenFile)) {
  const info = lstatSync(tokenFile);
  if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o077) || (process.getuid && info.uid !== process.getuid())) {
    throw new Error("Credential file must be an owner-only regular file (0600).");
  }
  token = readFileSync(tokenFile, "utf8").trim();
  if (!/^cbd_[A-Za-z0-9_-]{43}$/.test(token)) throw new Error("Existing credential format is not supported; refusing to overwrite it.");
} else {
  token = "cbd_" + randomBytes(32).toString("base64url");
  const fd = openSync(tokenFile, "wx", 0o600);
  try { writeFileSync(fd, token + "\n"); } finally { closeSync(fd); }
}
const digest = createHash("sha256").update(token).digest("hex");
const result = spawnSync("pnpm", ["exec", "wrangler", "secret", "put", "DRAFT_API_TOKEN_SHA256"], {
  cwd, input: digest + "\n", encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
});
// Wrangler's stdin and captured logs never become part of the task transcript.
if (result.status !== 0) {
  console.error("Could not configure the Worker secret. Local credential is preserved. Check Cloudflare authentication/account and rerun this command; do not create a second token.");
  process.exit(result.status || 1);
}
console.log(JSON.stringify({ configured: true, tokenFile, serverStores: "SHA-256 only", scope: "automation drafts and uploaded assets", publicPublicationEnabled: false }));
