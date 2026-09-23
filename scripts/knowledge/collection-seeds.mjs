// Migration configuration only; the workspace reads editable groups from the database.
export const collectionSeeds = [
  {
    slug: "addx-ai",
    name: "Addx",
    path: "Addx · 从面试准备到入职成长",
    sequence: [
      "company-research",
      "overview",
      "index",
      "07",
      "01",
      "02",
      "04",
      "06",
      "03",
      "05",
      "09",
      "08",
      "10",
      "11",
      "onboarding",
      "prd",
      "growth",
    ],
    topics: {
      "01": "architecture",
      "02": "design-system",
      "03": "observability",
      "04": "performance",
      "05": "observability",
      "06": "commerce",
      "07": "frontend",
      "08": "learning",
      "09": "ai-engineering",
      10: "learning",
      11: "learning",
      onboarding: "learning",
      prd: "ai-engineering",
      growth: "learning",
      "company-research": "learning",
      index: "learning",
      overview: "learning",
      "ai编排测试-技术设计文档-claude": "ai-engineering",
      "ai编排测试-技术设计文档-codex": "ai-engineering",
    },
  },
  {
    slug: "rightCapital",
    name: "RightCapital",
    path: "RightCapital · 基础到工程实践",
    sequence: [
      "01",
      "04",
      "05",
      "10",
      "35",
      "02",
      "21",
      "11",
      "34",
      "06",
      "27",
      "22",
      "23",
      "09",
      "28",
      "29",
      "32",
      "33",
      "03",
      "12",
      "24",
      "26",
      "31",
      "07",
      "08",
      "25",
      "30",
      "13",
    ],
    topics: {
      "01": "learning",
      "02": "architecture",
      "03": "performance",
      "04": "frontend",
      "05": "frontend",
      "06": "design-system",
      "07": "observability",
      "08": "observability",
      "09": "commerce",
      10: "frontend",
      11: "architecture",
      12: "performance",
      13: "architecture",
      21: "architecture",
      22: "frontend",
      23: "frontend",
      24: "performance",
      25: "observability",
      26: "performance",
      27: "design-system",
      28: "commerce",
      29: "commerce",
      30: "observability",
      31: "performance",
      32: "commerce",
      33: "commerce",
      34: "architecture",
      35: "frontend",
    },
  },
];

export function collectionTopic(source, slug) {
  return collectionSeeds.find((c) =>
    source.startsWith(`content/collections/${c.slug}/`),
  )?.topics[String(slug)];
}

export function seedCollections(sqlite, notes) {
  // Caller owns the import transaction. Seed memberships only with a newly created
  // group: repeat imports must preserve even intentionally emptied or reordered groups.
  for (const [index, seed] of collectionSeeds.entries()) {
    const members = notes
      .filter((n) => n.source.startsWith(`content/collections/${seed.slug}/`))
      .filter((n) =>
        sqlite
          .prepare("SELECT id FROM notes WHERE id=? AND deleted_at IS NULL")
          .get(n.id),
      )
      .sort(
        (a, b) =>
          Number(a.metadata.order ?? 999) - Number(b.metadata.order ?? 999) ||
          a.title.localeCompare(b.title, "zh-CN"),
      );
    if (!members.length) continue;
    const ordered = [...members].sort((a, b) => {
      const rank = (n) => {
        const i = seed.sequence.indexOf(String(n.slug));
        return i < 0 ? 999 : i;
      };
      return rank(a) - rank(b);
    });
    for (const [kind, name, items] of [
      ["project", seed.name, members],
      ["path", seed.path, ordered],
    ]) {
      const id = `${seed.slug}-${kind}`;
      const created = sqlite
        .prepare(
          "INSERT OR IGNORE INTO groups(id,name,kind,position) VALUES(?,?,?,?)",
        )
        .run(id, name, kind, 100 + index);
      if (!created.changes) continue;
      items.forEach((n, position) =>
        sqlite
          .prepare("INSERT INTO memberships VALUES(?,?,?)")
          .run(id, n.id, position),
      );
    }
  }
}
