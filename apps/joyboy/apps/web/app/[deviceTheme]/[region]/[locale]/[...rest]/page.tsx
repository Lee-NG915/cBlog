import { EcEnv } from '@castlery/config';
import { sbApiClient } from '@castlery/modules-cms-components';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { createMetadata, JsonLd } from '@castlery/seo';
import { slugToName } from '@castlery/utils';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { StoryblokPageContent } from './components/page-content';
import { keywords as defaultKeywords } from './config/keywords';
import { PageClient } from './page.client';
import { processPageContent } from './utils/content-processor';

export const revalidate = 600;

// TODO @carl-zhang111  SEO
export async function generateMetadata({ params }: { params: { rest: string[] } }) {
  const { rest } = params;
  const slug = rest.join('/');
  const data = await queryPageBySlug({ slug });

  if (!data || !data.content) {
    // Return a default metadata or handle as notFound if appropriate
    // For now, returning default metadata similar to the original logic's fallback
    return createMetadata({
      title: 'Page Not Found',
      description: '',
      keywords: defaultKeywords[EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() as keyof typeof defaultKeywords],
      robots: {
        index: false,
      },
    });
  }

  const { content } = data;
  const { meta } = content;
  let title = slugToName(slug);
  let description = '';
  let keywords: string | string[] =
    defaultKeywords[EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() as keyof typeof defaultKeywords];
  if (meta && meta.length > 0) {
    title = meta[0].title || title;
    description = meta[0].description || '';
    keywords = meta[0].keywords || keywords;
  }
  return createMetadata({
    title,
    description,
    keywords,
    robots: {
      index: meta?.[0]?.notIndexable ? false : true,
    },
  });
}

// TODO @Wcdaren 确定下这里未来使用啥渲染模式
export default async function Page({ params }: { params: { rest: string[] } }) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.CMS, domain: BUSINESS_DOMAIN.CMS });

  const { rest } = params;

  const story = await queryPageBySlug({ slug: rest.join('/') });
  if (!story) notFound();
  const { meta } = story.content;
  const notIndexable = meta?.[0]?.notIndexable || false;
  if (notIndexable) notFound();
  if (!story.content) notFound();
  let path = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/${rest.join('/')}`;
  if (story.path !== null) {
    path = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${story.path}`;
  }
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
  // 只对 Hero 组件中的图片进行预加载
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
      <link rel="canonical" href={path} />
      {hasFaqSchema && <JsonLd code={jsonLd} />}
      <PageClient pageVariant={rest.join('/')} dyCampaignsData={dyCampaignsData} />
      <StoryblokPageContent content={story.content} breadcrumb={story.content?.breadcrumb || ''} />
    </>
  );
}

// const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
//   const result = await sbApiClient.getRestPage(slug);
//   return result;
// });

const queryPageBySlug = async ({ slug }: { slug: string }) => {
  const result = await sbApiClient.getRestPage(slug);
  if (!result) {
    return null;
  }

  if (result.redirectUrl) {
    redirect(result.redirectUrl);
  }

  // const data = await sbApiClient.getSpecificPage(result?.full_slug);
  const data = await sbApiClient.getSpecificPage(result.full_slug);
  return data;
};
