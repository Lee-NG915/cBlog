const iso = (value) => {
  if (value == null) return null;
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value)))
    throw new Error("Invalid publication date");
  return new Date(value).toISOString();
};
export function contentEntries(model) {
  return [
    ...model.posts.map((item) => ({ route: `posts/${item.slug}`, item })),
    ...(model.collections || []).flatMap((c) => c.items.map((item) => ({ route: `${c.slug}/${item.slug}`, item }))),
  ];
}
// Metadata overlays never read private working drafts or replace public content.
export function applyPublicationDates(model, dates = {}) {
  for (const { route, item } of contentEntries(model)) {
    const date = dates[item.sourceId];
    if (!date) continue;
    if (date.route !== route) throw new Error("Publication date route mismatch");
    item.publishedAt = iso(date.publishedAt);
    if (!item.publishedAt) throw new Error("Missing first publication date");
    item.displayPublishedAt = iso(date.displayPublishedAt);
    item.editorialDate = item.displayPublishedAt || item.publishedAt;
    item.updatedAt = iso(date.editedAt);
    if (date.version !== undefined) item.sourceVersion = date.version;
  }
  return model;
}
export function assertDateOnlyChange(previous, next) {
  const content = (model) => contentEntries(model).map(({ route, item }) => {
    const { editorialDate, publishedAt, displayPublishedAt, updatedAt, sourceVersion, ...unchanged } = item;
    return [route, unchanged];
  }).sort(([a], [b]) => a.localeCompare(b));
  if (JSON.stringify(content(previous)) !== JSON.stringify(content(next)))
    throw new Error("Date-only publication changed article content");
}
