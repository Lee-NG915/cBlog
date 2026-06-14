import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const srcDir = path.dirname(currentFile);
const backendRoot = path.resolve(srcDir, "..");
const repoRoot = path.resolve(backendRoot, "..", "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const normalizedValue = rawValue.replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) {
      process.env[key] = normalizedValue;
    }
  }
}

loadEnvFile(path.join(repoRoot, ".env.local"));
loadEnvFile(path.join(backendRoot, ".env.local"));

export const paths = {
  backendRoot,
  repoRoot,
  dataDir: path.join(backendRoot, "data"),
  sessionsDir: path.join(backendRoot, "data", "sessions"),
};

export const serverConfig = {
  port: Number(process.env.INTERVIEW_BACKEND_PORT || "3334"),
  host: process.env.INTERVIEW_BACKEND_HOST || "127.0.0.1",
  allowedOrigins: (
    process.env.INTERVIEW_ALLOWED_ORIGINS ||
    "http://127.0.0.1:3000,http://localhost:3000"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

export const openAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || "",
  baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
};

function firstEnvValue(...keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}

export const proxyConfig = {
  url: firstEnvValue(
    "OPENAI_PROXY",
    "HTTPS_PROXY",
    "https_proxy",
    "HTTP_PROXY",
    "http_proxy",
    "ALL_PROXY",
    "all_proxy",
  ),
};

export const knowledgeSourceDefinitions = [
  {
    id: "blog",
    label: "cBlog",
    rootDir: path.join(repoRoot, "content", "posts"),
    kind: "markdown",
  },
  {
    id: "joyboy",
    label: "joyboy",
    rootDir: path.join(repoRoot, "apps", "joyboy"),
    kind: "repository",
  },
  {
    id: "onepiece",
    label: "onepiece",
    rootDir: path.join(repoRoot, "apps", "onepiece"),
    kind: "repository",
  },
];

export const indexConfig = {
  maxFileBytes: 120_000,
  maxCodeChunksPerFile: 3,
  codeLinesPerChunk: 90,
  maxReturnedChunks: 8,
};
