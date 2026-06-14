import { EcEnv } from '@castlery/config';
import { sbApiClient } from '@castlery/modules-cms-components';
import { createMetadata, keywords as defaultKeywords } from '@castlery/seo';
import { Content } from './components/content';
import { TC_ROUTE_CONFIG } from './config/keywords';
import { PageClient } from './page.client';
import { findNewestContent } from './utils/findNewestContent';
import {
  logger,
  captureStructuredError,
  setGlobalSentryContext,
  PAGE_TYPES,
  BUSINESS_DOMAIN,
  BusinessSeverity,
  BusinessPriority,
} from '@castlery/observability/server';

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  let pathToUse = `/${params.slug}`;

  if (EcEnv.NEXT_PUBLIC_COUNTRY === 'UK') {
    pathToUse = pathToUse.replace('guarantee', 'warranty');
  }

  const config = pathToUse ? TC_ROUTE_CONFIG[pathToUse as keyof typeof TC_ROUTE_CONFIG] : null;

  const title = config?.title || 'Terms and Conditions';
  const description = config?.description || 'Terms and Conditions';

  return createMetadata({
    title,
    description,
    keywords: defaultKeywords[EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() as keyof typeof defaultKeywords],
    robots: {
      index: true,
    },
  });
}

export default async function TACPage({ params }: { params: any }) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.CMS, domain: BUSINESS_DOMAIN.CMS });

  const path = params.slug;

  let pathToUse = path.replaceAll('-', '_');
  if (EcEnv.NEXT_PUBLIC_COUNTRY === 'UK') {
    pathToUse = pathToUse.replace('guarantee', 'warranty');
  }

  // 根据路径显示不同的内容
  const data: any =
    (await getSpecificPage({
      full_slug: `${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/general-content-v2/terms/terms-and-conditions`,
    })) || {};

  const errHtml = "<div style='height:100vh;'>Sorry, this page is temporarily unavailable.</div>";
  let content = errHtml;

  try {
    const terms = data?.content?.[pathToUse];
    const term = findNewestContent(terms);

    if (!term) {
      captureStructuredError(new Error('Term content not found: findNewestContent returned undefined'), {
        severity: BusinessSeverity.HIGH,
        priority: BusinessPriority.HIGH,
        extra: {
          step: 'Terms and Conditions data not found',
          path,
          pathToUse,
          termsAvailable: terms ? (Array.isArray(terms) ? terms.length : 'not_array') : 'undefined',
        },
      });
    }

    content = term?.content || errHtml;
  } catch (error) {
    logger.error('Failed to parse terms and conditions content', { error, path, pathToUse });
  }

  return (
    <>
      <PageClient />
      <Content content={content} path={path} />
    </>
  );
}

const getSpecificPage = async ({ full_slug }: { full_slug: string }) => {
  const result = await sbApiClient.getSpecificPage(full_slug);
  return result;
};
