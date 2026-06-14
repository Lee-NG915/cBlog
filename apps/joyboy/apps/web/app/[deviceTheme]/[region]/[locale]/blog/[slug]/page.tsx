import { notFound } from 'next/navigation';
import { EcEnv } from '@castlery/config';
import { sbApiClient } from '@castlery/modules-cms-components';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { getDate, getStoryblokProductList } from '@castlery/modules-cms-services';
import { BlogRecommendation } from '@castlery/modules-product-components';
import { JsonLd, Thing, WithContext } from '@castlery/seo';
import { BlogPageClient } from './page.client';
import { BlogPageContent } from './components/page-content';

export { generateMetadata } from './metadata';

export const revalidate = 600;

export const dynamic = 'force-static';

export default async function BlogPage({ params }: BlogPageProps) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.BLOG, domain: BUSINESS_DOMAIN.CMS });

  const { slug } = params;
  const story = await sbApiClient.getBlogPost(slug);
  if (!story) {
    notFound();
  }
  const blogBannerInfo: {
    image?: string;
    author?: string;
    title?: string;
  } = {};
  const storyblokProductList = {};
  const productIds = new Set();

  for (const item of story.content?.body || []) {
    if (item.component === 'blog-banner') {
      if (item.image?.[0]) {
        blogBannerInfo.image = item.image?.[0].desktop_url || '';
      }
      blogBannerInfo.author = item?.author;
      blogBannerInfo.title = item?.articleTitle || '';
      item.publishDate = story?.first_published_at || '';
    }

    if (item.component === 'detailed-product-listing' || item.component === 'simple-product-listing') {
      if (item?.product_id) {
        productIds.add(item.product_id);
      }
    }

    if (item.component === 'detailed-listing' || item.component === 'simple-listing') {
      if (item.items?.length > 0) {
        item.items
          .filter(
            (subItem) =>
              subItem.component === 'detailed-product-listing' || subItem.component === 'simple-product-listing'
          )
          .forEach((product) => {
            if (product.product_id) {
              productIds.add(product.product_id);
            }
          });
      }
    }
  }

  if (productIds.size > 0) {
    const products = await getStoryblokProductList([...productIds]);
    Object.assign(storyblokProductList, products);
  }

  const helmetData = {
    pathname: story?.slug || '',
    title: blogBannerInfo?.title || '',
    metaTitle: story.content?.meta[0]?.title || '',
    description: story.content?.meta[0]?.description || '',
    keywords: story.content?.meta[0]?.keywords || '',
    image: blogBannerInfo?.image || '',
    name: blogBannerInfo?.author || '',
    published_time: getDate(story?.first_published_at).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') || '',
    modified_time: getDate(story?.published_at).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') || '',
  };

  const rawStructureData = story?.content?.meta?.[0]?.structure_data;
  let parsedStructureData: WithContext<Thing> | null = null;

  if (rawStructureData) {
    if (typeof rawStructureData === 'string') {
      try {
        parsedStructureData = JSON.parse(rawStructureData) as WithContext<Thing>;
      } catch {
        parsedStructureData = null;
      }
    } else {
      parsedStructureData = rawStructureData as WithContext<Thing>;
    }
  }

  return (
    <>
      {parsedStructureData && <JsonLd code={parsedStructureData} />}
      {!parsedStructureData && (
        <JsonLd
          code={{
            '@type': 'Article',
            '@context': 'https://schema.org',
            publisher: {
              '@type': 'Organization',
              name: 'Castlery',
              logo: {
                '@type': 'ImageObject',
                width: '233',
                height: '60',
                url: 'https://res.cloudinary.com/castlery/image/upload/h_60,f_auto,q_auto/v1539080052/static/logo-b625f9aec86cac711ef4e9e92b6989d4.png',
              },
            },
            author: {
              '@type': 'Person',
              name: helmetData.name,
              url: EcEnv.NEXT_PUBLIC_ONEPIECE_HOST,
            },
            headline: helmetData.title,
            url: `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/blog/${helmetData.pathname}`,
            datePublished: helmetData.published_time,
            dateModified: helmetData.modified_time,
            image: {
              '@type': 'ImageObject',
              url: helmetData.image,
              width: '1080',
              height: '720',
            },
            thumbnailUrl: helmetData.image,
            keywords: helmetData.keywords,
            description: helmetData.description,
            mainEntityOfPage: `${
              EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
            }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/blog/${helmetData.pathname}`,
            isAccessibleForFree: true,
          }}
        />
      )}
      <link
        rel="canonical"
        href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/blog/${
          helmetData.pathname
        }`}
      />
      <BlogPageClient storyblokProductList={storyblokProductList} slug={helmetData.pathname} />
      <BlogPageContent content={story.content} helmetData={helmetData} />
      <BlogRecommendation selectorName="Blog Rec on Blog Page - API" />
    </>
  );
}
interface BlogPageProps {
  params: {
    region: string;
    slug: string;
  };
}
