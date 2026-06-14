import fs from "node:fs";
import path from "node:path";
import { indexConfig, knowledgeSourceDefinitions } from "./config.mjs";

const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".yml",
  ".yaml",
]);

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "coverage",
  "tmp",
  "log",
  ".nx",
  ".turbo",
  "build",
  "out",
]);

let knowledgeCache = null;

function tokenize(value) {
  return Array.from(
    new Set(
      (value.toLowerCase().match(/[a-z0-9_/-]{2,}|[\u4e00-\u9fff]{1,}/g) || [])
        .map((token) => token.trim())
        .filter(Boolean)
    )
  );
}

function walkFiles(rootDir, relativeDir = "") {
  const absoluteDir = path.join(rootDir, relativeDir);
  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".DS_Store")) {
      continue;
    }

    const absolutePath = path.join(absoluteDir, entry.name);
    const relativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) {
        continue;
      }
      files.push(...walkFiles(rootDir, relativePath));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!CODE_EXTENSIONS.has(extension)) {
      continue;
    }

    const stat = fs.statSync(absolutePath);
    if (stat.size > indexConfig.maxFileBytes) {
      continue;
    }

    files.push({
      absolutePath,
      relativePath,
      extension,
      size: stat.size,
    });
  }

  return files;
}

function splitMarkdownSections(relativePath, content) {
  const lines = content.split(/\r?\n/);
  const sections = [];
  let currentTitle = path.basename(relativePath, path.extname(relativePath));
  let buffer = [];

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (!text) {
      return;
    }

    sections.push({
      title: currentTitle,
      text,
    });
  };

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (match) {
      flush();
      currentTitle = match[2].trim();
      buffer = [line];
      continue;
    }

    buffer.push(line);
  }

  flush();
  return sections;
}

function createMarkdownChunks(source, file) {
  const raw = fs.readFileSync(file.absolutePath, "utf8");
  const sections = splitMarkdownSections(file.relativePath, raw);

  return sections.map((section, index) => {
    const text = `Path: ${file.relativePath}\nSection: ${section.title}\n\n${section.text}`;
    return {
      id: `${source.id}:${file.relativePath}:md:${index}`,
      sourceId: source.id,
      sourceLabel: source.label,
      kind: "markdown",
      title: section.title,
      path: file.relativePath,
      text,
      excerpt: section.text.slice(0, 320),
      tokens: tokenize(`${file.relativePath} ${section.title} ${section.text}`),
    };
  });
}

function createCodeChunks(source, file) {
  const raw = fs.readFileSync(file.absolutePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const chunks = [];

  for (
    let start = 0, chunkIndex = 0;
    start < lines.length && chunkIndex < indexConfig.maxCodeChunksPerFile;
    start += indexConfig.codeLinesPerChunk, chunkIndex += 1
  ) {
    const slice = lines
      .slice(start, start + indexConfig.codeLinesPerChunk)
      .join("\n")
      .trim();

    if (!slice) {
      continue;
    }

    const lineStart = start + 1;
    const lineEnd = Math.min(start + indexConfig.codeLinesPerChunk, lines.length);
    const title = `${file.relativePath}:${lineStart}-${lineEnd}`;
    const text = `Path: ${file.relativePath}\nLines: ${lineStart}-${lineEnd}\n\n${slice}`;

    chunks.push({
      id: `${source.id}:${file.relativePath}:code:${chunkIndex}`,
      sourceId: source.id,
      sourceLabel: source.label,
      kind: "code",
      title,
      path: file.relativePath,
      text,
      excerpt: slice.slice(0, 320),
      tokens: tokenize(`${file.relativePath} ${slice}`),
    });
  }

  return chunks;
}

function indexSource(source) {
  if (!fs.existsSync(source.rootDir)) {
    return {
      sourceId: source.id,
      label: source.label,
      kind: source.kind,
      available: false,
      fileCount: 0,
      chunkCount: 0,
    };
  }

  const files = walkFiles(source.rootDir);
  const chunks = [];

  for (const file of files) {
    if (source.kind === "markdown" || file.extension === ".md" || file.extension === ".mdx") {
      chunks.push(...createMarkdownChunks(source, file));
      continue;
    }

    chunks.push(...createCodeChunks(source, file));
  }

  return {
    sourceId: source.id,
    label: source.label,
    kind: source.kind,
    available: true,
    fileCount: files.length,
    chunkCount: chunks.length,
    chunks,
  };
}

export function buildKnowledgeBase({ force = false } = {}) {
  if (knowledgeCache && !force) {
    return knowledgeCache;
  }

  const indexedSources = knowledgeSourceDefinitions.map(indexSource);
  const chunks = indexedSources.flatMap((source) => source.chunks || []);

  knowledgeCache = {
    builtAt: new Date().toISOString(),
    sources: indexedSources.map(({ chunks: _chunks, ...source }) => source),
    chunks,
  };

  return knowledgeCache;
}

export function getSourceSummaries() {
  return buildKnowledgeBase().sources;
}

function scoreChunk(chunk, queryTokens) {
  const tokenMatches = queryTokens.filter((token) => chunk.tokens.includes(token)).length;
  const pathMatches = queryTokens.filter((token) =>
    chunk.path.toLowerCase().includes(token)
  ).length;
  const markdownBonus = chunk.kind === "markdown" ? 0.6 : 0;
  return tokenMatches * 3 + pathMatches * 4 + markdownBonus;
}

export function retrieveRelevantChunks({ query, scopes = [], limit = indexConfig.maxReturnedChunks }) {
  const base = buildKnowledgeBase();
  const queryTokens = tokenize(query);
  const allowedScopes = scopes.length > 0 ? new Set(scopes) : null;

  return base.chunks
    .filter((chunk) => !allowedScopes || allowedScopes.has(chunk.sourceId))
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, queryTokens),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      sourceId: item.chunk.sourceId,
      sourceLabel: item.chunk.sourceLabel,
      title: item.chunk.title,
      path: item.chunk.path,
      kind: item.chunk.kind,
      excerpt: item.chunk.excerpt,
      text: item.chunk.text,
      score: item.score,
    }));
}

export function formatChunkReferences(chunks) {
  if (chunks.length === 0) {
    return "No direct references found.";
  }

  return chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] ${chunk.sourceLabel} :: ${chunk.path}\n${chunk.text}`
    )
    .join("\n\n");
}
