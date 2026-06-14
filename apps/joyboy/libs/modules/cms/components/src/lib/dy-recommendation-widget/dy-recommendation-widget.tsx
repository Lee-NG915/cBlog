'use client';
import { Stack } from '@castlery/fortress';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { formatCampaignsResponse } from '@castlery/utils';
import { useSearchParams } from 'next/navigation';

export function DyRecommendationWidget({ blok }: any) {
  const { template, campaign_name, recommendationAttributes = {} } = blok;
  const dyApiPreview = useSearchParams().get('dyApiPreview') || '';
  const campagin = useGetDyCampaignsQuery(
    {
      campaignNames: [campaign_name],
      customPageAttributes: {
        ...recommendationAttributes,
      },
      query: { dyApiPreview },
    },
    { skip: !campaign_name }
  );
  const dyData = formatCampaignsResponse(campagin.data?.choices);

  return (
    <Stack {...storyblokEditable(blok)} key={blok._uid}>
      <StoryblokServerComponent blok={{ ...template[0], dyCampaignData: dyData[campaign_name] }} />
    </Stack>
  );
}
export default DyRecommendationWidget;
