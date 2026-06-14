import { EcEnv } from '@castlery/config';
import { sbApiClient } from '@castlery/modules-cms-components';
import { createMetadata, DEFAULT_IMAGE, JsonLd } from '@castlery/seo';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { processPageContent } from '../[...rest]/utils/content-processor';
import { StoryblokPageContent } from './components/page-content';
import { keywords as defaultKeywords } from './config/keywords';
import { HomePageClient } from './page.client';
import { HomeDyTagServer } from '@castlery/modules-composite-components';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export const revalidate = 600;

export async function generateMetadata() {
  const full_slug = `${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/general-content-v2/main-pages/home-page-brand-refresh`;
  const result = await sbApiClient.getSpecificPage(full_slug);
  if (!result || !result.content) {
    return createMetadata({
      title: 'Home',
      description: '',
      keywords: defaultKeywords[EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() as keyof typeof defaultKeywords],
      image: DEFAULT_IMAGE,
      robots: {
        index: true,
      },
    });
  } else {
    return createMetadata({
      title: result.content.meta?.[0]?.title || '',
      description: result.content.meta?.[0]?.description || '',
      keywords: defaultKeywords[EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() as keyof typeof defaultKeywords],
      image: DEFAULT_IMAGE,
      robots: {
        index: true,
      },
    });
  }
}

export default async function HomePage({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params: { locale, region },
}: {
  params: {
    locale: string;
    region: string;
  };
}) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.HOME, domain: BUSINESS_DOMAIN.CMS });

  const story = await getSpecificPage({
    full_slug: `${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/general-content-v2/main-pages/home-page-brand-refresh`,
  });
  if (!story) return notFound();

  const structuredData = story.content.meta?.[0]?.structure_data;
  const dyCampaignsData: Record<string, any> = {};

  // 获取 cookieContext
  const cookieContext = { cookies };

  // 使用工具函数处理页面内容
  const contentResult = processPageContent(story.content, cookieContext, dyCampaignsData);

  // 使用工具函数处理 Hero 组件
  // const heroResult = processHeroComponent(story.content, cookieContext, dyCampaignsData);

  // 合并所有结果
  const allDyCampaignPromises = contentResult.dyCampaignPromises;
  const hasFaqSchema = contentResult.hasFaqSchema;
  const jsonLd = contentResult.jsonLd;

  // 使用 Promise.all 并行执行所有异步请求
  const asyncPromises: Promise<any>[] = [];

  // 添加所有 dyCampaignsFetcher 请求
  asyncPromises.push(...allDyCampaignPromises);

  // 等待所有异步请求完成
  if (asyncPromises.length > 0) {
    await Promise.all(asyncPromises);
  }

  return (
    <>
      {structuredData && structuredData !== '' && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      )}
      <link
        rel="canonical"
        href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`}
      />
      {hasFaqSchema && <JsonLd code={jsonLd} />}
      <HomeDyTagServer />
      <HomePageClient pageVariant={story.full_slug} dyCampaignsData={dyCampaignsData} />
      <StoryblokPageContent content={story.content} breadcrumb={story.content?.breadcrumb || ''} />
    </>
  );
}

const getSpecificPage = async ({ full_slug }: { full_slug: string }) => {
  // const result = await sbApiClient.getSpecificPageWithoutCache(full_slug, {
  //   cv: getTimestamp(),
  // });
  const result = await sbApiClient.getSpecificPage(full_slug);
  return result;
};
