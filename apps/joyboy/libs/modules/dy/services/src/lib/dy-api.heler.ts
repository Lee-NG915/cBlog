import { dyCampaignsFetcher, type CampaignsRequestOptions, type CookieContext } from '@castlery/modules-dy-domain';
import { formatCampaignsResponse } from './dy-data.helper';

export const getDyCampaigns = async (options: CampaignsRequestOptions, cookieContext?: CookieContext) => {
  const res = await dyCampaignsFetcher(options, cookieContext);
  if (!res.ok) {
    throw Error('Failed to fetch');
  }

  try {
    const data = await res.json();
    return formatCampaignsResponse(data.choices);
  } catch (e) {
    throw Error('Failed to parse response');
  }
};
