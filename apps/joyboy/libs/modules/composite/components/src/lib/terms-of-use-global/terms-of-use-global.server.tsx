import { TermsOfUseGlobalClient } from './terms-of-use-global.client';
import { getTermsOfUseServer } from '@castlery/modules-cms-domain/server';
import { logger } from '@castlery/observability/server';

export const TermsOfUseGlobalServer = async () => {
  try {
    const res = await getTermsOfUseServer(undefined, {
      revalidate: 60,
    });
    const termsOfUse = res?.content?.termsHistory;
    return <TermsOfUseGlobalClient termsOfUse={termsOfUse} />;
  } catch (error) {
    logger.error('Failed to fetch terms of use', { error });
    return null;
  }
};
