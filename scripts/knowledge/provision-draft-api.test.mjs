import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, statSync, existsSync, rmSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./provision-draft-api.mjs", import.meta.url));
function fixture(existingRemote = false) {
  const dir = mkdtempSync(path.join(tmpdir(), "cblog-draft-provision-"));
  const captured = path.join(dir, "captured"), tokenFile = path.join(dir, "token");
  const fake = path.join(dir, "pnpm");
  writeFileSync(fake, `#!/usr/bin/env node
const fs = require('node:fs');
if(process.argv.at(-1)==='list') console.log(JSON.stringify(${JSON.stringify(existingRemote ? [{ name: "DRAFT_API_TOKEN_SHA256" }] : [])}));
else { let input=''; process.stdin.on('data',x=>input+=x); process.stdin.on('end',()=>fs.writeFileSync(process.env.CAPTURE_PATH,input)); }
`, { mode: 0o700 });
  return { dir, tokenFile, captured,
    run: () => spawnSync(process.execPath, [script, "--token-file", tokenFile], { encoding: "utf8", env: { ...process.env, PATH: dir + path.delimiter + process.env.PATH, CAPTURE_PATH: captured } }),
    close: () => rmSync(dir, { recursive: true, force: true }),
  };
}
test("provision stores an owner-only token and sends only its hash, without exposing it", () => {
  const f = fixture();
  try {
    const first = f.run(); assert.equal(first.status, 0, first.stderr);
    const token = readFileSync(f.tokenFile, "utf8").trim();
    assert.match(token, /^cbd_[A-Za-z0-9_-]{43}$/);
    assert.equal(statSync(f.tokenFile).mode & 0o777, 0o600);
    assert.equal(readFileSync(f.captured, "utf8").trim(), createHash("sha256").update(token).digest("hex"));
    assert.ok(!(first.stdout + first.stderr).includes(token));
    const repeat = f.run(); assert.equal(repeat.status, 0, repeat.stderr);
    assert.equal(readFileSync(f.tokenFile, "utf8").trim(), token);
  } finally { f.close(); }
});
test("missing local token never replaces an existing remote credential", () => {
  const f = fixture(true);
  try { const r = f.run(); assert.notEqual(r.status, 0); assert.equal(existsSync(f.tokenFile), false); assert.equal(existsSync(f.captured), false); }
  finally { f.close(); }
});
test("rejects a readable-by-others credential without calling secret put", () => {
  const f = fixture();
  try {
    writeFileSync(f.tokenFile, "cbd_" + "a".repeat(43)); chmodSync(f.tokenFile, 0o644);
    const r = f.run(); assert.notEqual(r.status, 0); assert.equal(existsSync(f.captured), false);
  } finally { f.close(); }
});
