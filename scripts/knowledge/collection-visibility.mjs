export function applyCollectionVisibility(model, settings = {}) {
  model.collections = (model.collections || []).flatMap((c) => {
    const visibility = settings[c.slug]?.visibility || "public";
    if (!["public", "unlisted", "private"].includes(visibility)) throw new Error("Invalid collection visibility");
    if (visibility === "private") return [];
    return [{ ...c, visibility, noindex: visibility === "unlisted" || c.noindex }];
  });
  return model;
}
export function publicCollections(model) {
  return (model.collections || []).map(c=>({slug:c.slug,visibility:c.visibility || "public",articleCount:c.items.length}));
}
export function assertCollectionOnlyChange(previous, next) {
  const slug = next.intent?.collectionSlug;
  if (!slug || !/^[\w-]+$/.test(slug)) throw new Error("Missing collection action");
  for (const key of ["notes","withdrawals","publicationDates","categories","references"])
    if (JSON.stringify(previous[key]) !== JSON.stringify(next[key]))
      throw new Error("Collection visibility must not change article content or dates");
  const others = settings => Object.fromEntries(Object.entries(settings || {}).filter(([key])=>key!==slug).sort(([a],[b])=>a.localeCompare(b)));
  if (JSON.stringify(others(previous.collectionVisibility)) !== JSON.stringify(others(next.collectionVisibility)))
    throw new Error("Collection action changed another collection");
  if (next.collectionVisibility?.[slug]?.visibility !== next.intent.visibility)
    throw new Error("Collection action does not match visibility");
}
