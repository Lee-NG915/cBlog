// 为共用同一张封面的文章生成差异化几何封面，复用 FeaturedPost 像素格视觉语言
const fs = require("fs");
const path = require("path");

const posts = [
  "building-user-profile",
  "consumption-scene-segmentation",
  "growth-strategy-basics",
  "product-learning-4",
];

// 站点调色板（tailwind.config.js）
const palette = ["#D4866A", "#C08B2C", "#667A54", "#315F72", "#B95832"];

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 800;
const H = 450;
const COLS = 10;
const ROWS = 6;
const GAP = 10;
const cellW = (W - GAP * (COLS + 1)) / COLS;
const cellH = (H - GAP * (ROWS + 1)) / ROWS;

for (const slug of posts) {
  const rand = mulberry32(hashSeed(slug));
  const rects = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = GAP + c * (cellW + GAP);
      const y = GAP + r * (cellH + GAP);
      const roll = rand();
      let fill;
      if (roll < 0.16) {
        const color = palette[Math.floor(rand() * palette.length)];
        const opacity = 0.35 + rand() * 0.35;
        fill = `fill="${color}" fill-opacity="${opacity.toFixed(2)}"`;
      } else if (roll < 0.24) {
        const color = palette[Math.floor(rand() * palette.length)];
        fill = `fill="${color}" fill-opacity="${(0.12 + rand() * 0.12).toFixed(2)}"`;
      } else {
        fill = `fill="#ffffff" fill-opacity="${(0.03 + rand() * 0.04).toFixed(2)}"`;
      }
      rects.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellW.toFixed(1)}" height="${cellH.toFixed(1)}" rx="6" ${fill} stroke="#ffffff" stroke-opacity="0.06"/>`
      );
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#22201D"/>
  ${rects.join("\n  ")}
</svg>
`;

  const out = path.join(
    __dirname,
    "..",
    "public",
    "images",
    "covers",
    "study",
    `${slug}.svg`
  );
  fs.writeFileSync(out, svg);
  console.log("written", out);
}
