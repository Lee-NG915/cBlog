import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

export async function getTxtRecords(domain: string): Promise<string[][]> {
  try {
    const records = await resolveTxt(domain);
    return records;
  } catch (err) {
    console.error(JSON.stringify({ message: 'Poll maintenance status error', error: err }, null, 2));
    return [];
  }
}

// poll DNS record to check if the site is under maintenance
export function pollMaintainDNSRecord() {
  const country = __COUNTRY__.toLocaleLowerCase();
  let previousRecord: string | null = 'off';
  const domain = `${country}-maintenance-status.castlery.com`;
  const pollMs = 1000 * 60 * 1; // 1 minutes
  setInterval(async () => {
    const records = await getTxtRecords(domain);
    const currentRecord = records?.[0]?.[0] || 'off';
    if (previousRecord !== currentRecord) {
      if (currentRecord === 'on') {
        (global as any).__maintenance__ = true;
      } else if (currentRecord === 'off') {
        (global as any).__maintenance__ = false;
      }
      previousRecord = currentRecord;
    }
  }, pollMs);
}
