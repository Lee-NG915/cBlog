#!/usr/bin/env node

import fs from 'node:fs';

const inputPath = process.argv[2] || '.tmp/sentry-mock/server-envelopes.ndjson';

if (!fs.existsSync(inputPath)) {
  console.error(`[sentry-summary] file not found: ${inputPath}`);
  process.exit(1);
}

const lines = fs
  .readFileSync(inputPath, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const rows = [];

for (const line of lines) {
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    continue;
  }

  const timestamp = record.timestamp || '';
  const items = record?.envelope?.items || [];

  for (const item of items) {
    const type = item?.header?.type || 'unknown';
    const payload = item?.payload;
    const tags = (payload && typeof payload === 'object' ? payload.tags : null) || {};
    const message =
      (payload && typeof payload === 'object' && (payload.message || payload?.exception?.values?.[0]?.value)) || '';

    rows.push({
      timestamp,
      type,
      pageType: tags.page_type || '-',
      domain: tags.domain || '-',
      errorBucket: tags.error_bucket || '-',
      message: String(message || '-').replace(/\s+/g, ' ').slice(0, 140),
    });
  }
}

if (rows.length === 0) {
  console.log(`[sentry-summary] no envelope items found in ${inputPath}`);
  process.exit(0);
}

console.log(`Sentry Server Envelope Summary (${inputPath})`);
console.log('time | type | page_type | domain | error_bucket | message');
console.log('--- | --- | --- | --- | --- | ---');
for (const row of rows) {
  console.log(
    `${row.timestamp} | ${row.type} | ${row.pageType} | ${row.domain} | ${row.errorBucket} | ${row.message}`
  );
}
