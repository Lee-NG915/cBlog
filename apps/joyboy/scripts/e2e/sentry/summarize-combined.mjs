#!/usr/bin/env node

import fs from 'node:fs';

const serverPath = process.argv[2] || '.tmp/sentry-mock/server-envelopes.ndjson';
const clientPath = process.argv[3] || '.tmp/sentry-mock/client-envelopes.ndjson';

function readNdjson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

const serverRecords = readNdjson(serverPath);
const clientRecords = readNdjson(clientPath);
const rows = [];

for (const rec of serverRecords) {
  const timestamp = rec.timestamp || '';
  const items = rec?.envelope?.items || [];
  for (const item of items) {
    const type = item?.header?.type || 'unknown';
    const payload = item?.payload;
    const tags = (payload && typeof payload === 'object' ? payload.tags : null) || {};
    const message =
      (payload && typeof payload === 'object' && (payload.message || payload?.exception?.values?.[0]?.value)) || '-';
    rows.push({
      time: timestamp,
      source: 'server',
      type,
      pageType: tags.page_type || '-',
      domain: tags.domain || '-',
      errorBucket: tags.error_bucket || '-',
      message: String(message).replace(/\s+/g, ' ').slice(0, 140),
    });
  }
}

for (const rec of clientRecords) {
  const timestamp = rec.timestamp || '';
  const env = rec.envelope || {};
  rows.push({
    time: timestamp,
    source: 'client',
    type: env.type || 'event',
    pageType: env.tags?.page_type || '-',
    domain: env.tags?.domain || '-',
    errorBucket: env.tags?.error_bucket || '-',
    message: String(env.message || env.exception?.values?.[0]?.value || '-')
      .replace(/\s+/g, ' ')
      .slice(0, 140),
  });
}

rows.sort((a, b) => a.time.localeCompare(b.time));

if (rows.length === 0) {
  console.log(`[sentry-combined] no records found. server=${serverPath}, client=${clientPath}`);
  process.exit(0);
}

console.log(`Sentry Combined Summary`);
console.log(`server: ${serverPath}`);
console.log(`client: ${clientPath}`);
console.log('time | source | type | page_type | domain | error_bucket | message');
console.log('--- | --- | --- | --- | --- | --- | ---');
for (const r of rows) {
  console.log(`${r.time} | ${r.source} | ${r.type} | ${r.pageType} | ${r.domain} | ${r.errorBucket} | ${r.message}`);
}
