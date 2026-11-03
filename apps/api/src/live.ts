import type { Bindings } from "./types";

export type LiveNote = {
  id: string;
  route: string;
  version: number | null;
  contentHash?: string | null;
    publishedAt?: string | null;
    displayPublishedAt?: string | null;
    editedAt?: string | null;
};
export async function lastPublication(env: Bindings) {
  return env.DB.prepare(
    `SELECT p.id,p.manifest,j.id AS job_id FROM publications p
    JOIN build_jobs j ON j.publication_id=p.id WHERE j.status='succeeded'
    ORDER BY j.updated_at DESC,j.created_at DESC LIMIT 1`,
  ).first<{ id: number; manifest: string; job_id: string }>();
}
export type PublicationMetadata = {
  id: number;
  job_id: string;
  collection_visibility: string | null;
};
// Status reads do not need article bodies. Keep lastPublication for snapshot writes.
export async function lastPublicationMetadata(env: Bindings) {
  return env.DB.prepare(
    `SELECT p.id,j.id AS job_id,
    json_extract(p.manifest,'$.collectionVisibility') AS collection_visibility
    FROM publications p JOIN build_jobs j ON j.publication_id=p.id
    WHERE j.status='succeeded'
    ORDER BY j.updated_at DESC,j.created_at DESC LIMIT 1`,
  ).first<PublicationMetadata>();
}
export async function liveNotes(
  env: Bindings,
  publication?: PublicationMetadata | null,
): Promise<LiveNote[]> {
  const last = publication === undefined ? await lastPublicationMetadata(env) : publication;
  if (!last) return [];
  const inventory = await env.DB.prepare(
    "SELECT notes FROM live_site WHERE id=1 AND job_id=?",
  )
    .bind(last.job_id)
    .first<{ notes: string }>();
  if (inventory) return JSON.parse(inventory.notes);
  // Upgrade compatibility: prior deployments exposed only a version marker.
  // Project legacy inventory in D1 instead of transferring the entire snapshot.
  const notes = await env.DB.prepare(
    `SELECT json_extract(n.value,'$.id') AS id,
    json_extract(n.value,'$.slug') AS slug,
    json_extract(n.value,'$.route') AS route,
    json_extract(n.value,'$.version') AS version
    FROM publications p,json_each(p.manifest,'$.notes') n WHERE p.id=?`,
  ).bind(last.id).all<{ id: string; slug: string; route: string | null; version: number | null }>();
  return notes.results.map(
    (n) => ({
      id: n.id,
      route: n.route || `posts/${n.slug}`,
      version: n.version ?? null,
    }),
  );
}
export async function noteInFlight(env: Bindings, id: string) {
  return !!(await env.DB.prepare(
    `SELECT j.id FROM build_jobs j JOIN publications p ON p.id=j.publication_id,
    json_each(p.manifest,'$.notes') n WHERE j.status IN ('dispatching','queued','building','deploying')
    AND json_extract(n.value,'$.id')=? LIMIT 1`,
  )
    .bind(id)
    .first());
}
export async function needsUnpublish(env: Bindings, id: string) {
  return (
    (await liveNotes(env)).some((n) => n.id === id) ||
    (await noteInFlight(env, id))
  );
}
