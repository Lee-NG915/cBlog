import { Footer as CFooter } from '@castlery/modules-product-components';
import { sbApiClient } from '../storyblok';

export async function Footer() {
  const data = await sbApiClient.getGlobalFooter();
  if (!data) return;
  const { bottomList, footerData, mobileList, socialList, newsletterHeaderTitle } = data;
  return (
    <CFooter
      bottomList={bottomList}
      footerData={footerData}
      mobileList={mobileList}
      socialList={socialList}
      newsletterHeaderTitle={newsletterHeaderTitle}
    />
  );
}
