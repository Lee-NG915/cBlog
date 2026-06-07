#!/usr/bin/env node
/** Write { pages: [...] } to docs/confluence-export/.responses/batch-NNN.json */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs/confluence-export/.responses');

const batchNum = process.argv[2];
const inputPath = process.argv[3];
if (!batchNum || !inputPath) {
  console.error('Usage: node scripts/save-confluence-batch.mjs <NNN> <input.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
const pages = data.pages || (Array.isArray(data) ? data : [data]);
fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, `batch-${String(batchNum).padStart(3, '0')}.json`);
fs.writeFileSync(outPath, JSON.stringify({ pages }, null, 2) + '\n');
console.log(`Wrote ${pages.length} pages -> ${outPath}`);
