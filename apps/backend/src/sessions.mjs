import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { paths } from "./config.mjs";

function ensureStorage() {
  fs.mkdirSync(paths.sessionsDir, { recursive: true });
}

function getSessionFile(sessionId) {
  return path.join(paths.sessionsDir, `${sessionId}.json`);
}

export function createSession(payload) {
  ensureStorage();

  const session = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "in_progress",
    ...payload,
    messages: [],
    summary: null,
  };

  fs.writeFileSync(getSessionFile(session.id), JSON.stringify(session, null, 2));
  return session;
}

export function readSession(sessionId) {
  ensureStorage();
  const file = getSessionFile(sessionId);

  if (!fs.existsSync(file)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function saveSession(session) {
  ensureStorage();
  session.updatedAt = new Date().toISOString();
  fs.writeFileSync(getSessionFile(session.id), JSON.stringify(session, null, 2));
  return session;
}
