import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";

// Only the immutable public snapshot and its referenced images enter this archive.
// It is an Actions artifact, never copied into the public website.
export function saveSource(directory, source, assets = new Map()) {
  mkdirSync(path.join(directory, "assets"), { recursive: true });
  writeFileSync(path.join(directory, "source.json"), JSON.stringify(source));
  for (const [id, bytes] of assets) {
    if (!/^[a-f0-9]{64}$/.test(id)) throw new Error("Invalid source asset ID");
    writeFileSync(path.join(directory, "assets", id), bytes);
  }
}

export function validateSource(source, siteUrl, publication) {
  if (source.version !== 1 || source.siteUrl !== siteUrl)
    throw new Error("Published source version or site does not match");
  if (source.kind === "legacy") {
    if (!/^[a-f0-9]{40}$/.test(source.contentRef) || publication !== null)
      throw new Error("Cannot use legacy content for a database publication");
  } else if (source.kind === "snapshot") {
    const s = source.snapshot;
    if (!s || !publication || s.jobId !== publication.jobId ||
        s.publicationId !== publication.publicationId ||
        s.manifest?.revision !== publication.revision)
      throw new Error("Archive does not match the live publication");
  } else throw new Error("Unknown published source kind");
  return source;
}

export function readSource(directory) {
  return JSON.parse(readFileSync(path.join(directory, "source.json"), "utf8"));
}
