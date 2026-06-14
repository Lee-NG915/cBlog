import { EcEnv } from '@castlery/config';
import { sbApiClient } from '../../storyblok';
import { ProductFaqListClient } from './product-faq-list.client';

export const ProductFaqListServer = async () => {
  const faqsData = await sbApiClient.getStory(
    `${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/general-configuration/universal-config-new-joyboy/pdp/pdp-faq-list`
  );

  if (faqsData?.content?.faqs?.length > 0) {
    return <ProductFaqListClient faqs={faqsData.content.faqs} />;
  }

  return null;
};
