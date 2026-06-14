import { TheCastleryClubPage as TheCastleryClubPageComponent } from '@castlery/modules-composite-components';
import { SbPage } from '@castlery/modules-cms-components';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default function TheCastleryClubPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.USER });

  return (
    <>
      <TheCastleryClubPageComponent SbPageComponent={SbPage} />
    </>
  );
}
