import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const mappings = [
  {
    source: "/Users/colorli/castlery/mergeProject/joyboy",
    target: path.join(repoRoot, "apps/joyboy"),
  },
  {
    source: "/Users/colorli/castlery/mergeProject/onepiece",
    target: path.join(repoRoot, "apps/onepiece"),
  },
];

for (const mapping of mappings) {
  if (!fs.existsSync(mapping.source)) {
    console.warn(`skip missing source: ${mapping.source}`);
    continue;
  }

  fs.mkdirSync(mapping.target, { recursive: true });

  const result = spawnSync(
    "rsync",
    [
      "-a",
      "--delete",
      "--exclude=.git",
      "--exclude=node_modules",
      "--exclude=dist",
      "--exclude=.next",
      "--exclude=.nx",
      "--exclude=coverage",
      "--exclude=tmp",
      "--exclude=log",
      `${mapping.source}/`,
      `${mapping.target}/`,
    ],
    {
      stdio: "inherit",
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
