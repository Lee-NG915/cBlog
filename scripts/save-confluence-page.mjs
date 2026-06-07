#!/usr/bin/env node
/** Save a getConfluencePage JSON response to .responses/pages/{id}.json */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, '../docs/confluence-export/.responses/pages');

const input = fs.readFileSync(0, 'utf8');
const page = JSON.parse(input);
if (!page?.id) {
  console.error('Invalid page JSON: missing id');
  process.exit(1);
}
fs.mkdirSync(pagesDir, { recursive: true });
const out = path.join(pagesDir, `${page.id}.json`);
fs.writeFileSync(out, JSON.stringify(page) + '\n');
console.log(`Saved ${out}`);
