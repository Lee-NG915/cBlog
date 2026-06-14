import { getStoryblokApi } from '@storyblok/react';
import { logger } from '@castlery/observability';

const fetchInClient = async () => {
  const storyblokApi = getStoryblokApi();
  const params: {
    version: 'draft' | 'published';
    cv: number;
  } = {
    version: 'draft',
    cv: 1720767572000,
  };
  const response = await storyblokApi.get(`cdn/stories/menu`, params);
  logger.info('fetchInClient response', { response });
};

export { fetchInClient };
