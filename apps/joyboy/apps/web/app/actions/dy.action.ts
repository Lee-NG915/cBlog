'use server';
// To call a Server Action in a Client Component, create a new file and add the "use server" directive at the top of it.
// All functions within the file will be marked as Server Actions that can be reused in both Client and Server Components
import { type CampaignsRequestOptions, dyCampaignsFetcher } from '@castlery/modules-dy-domain';
import { formatCampaignsResponse } from '@castlery/modules-dy-services';
import { cookies } from 'next/headers';
import { logger, captureStructuredError, BusinessSeverity } from '@castlery/observability/server';

// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
/**
 * server action中fetch请求不会被默认缓存
 * @param options
 * @returns
 */
export const fetchDyCampaigns = async (options: CampaignsRequestOptions) => {
  try {
    const res = await dyCampaignsFetcher(options, { cookies });
    if (!res.ok) {
      const error = new Error(`DY campaigns fetch failed with status ${res.status}`);
      logger.error('Failed to fetch DY campaigns from server', { status: res.status });
      captureStructuredError(error, {
        severity: BusinessSeverity.LOW,
        tags: { action_name: 'fetchDyCampaigns', action_type: 'server_action' },
        extra: { status: res.status },
      });
      return {};
    }
    const data = await res.json();
    const detail = formatCampaignsResponse(data.choices);
    return detail;
  } catch (err) {
    captureStructuredError(err as Error, {
      severity: BusinessSeverity.LOW,
      tags: { action_name: 'fetchDyCampaigns', action_type: 'server_action' },
    });
    return {};
  }
};
