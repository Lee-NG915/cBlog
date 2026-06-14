import { CategoryLandingPage } from '@castlery/modules-search-components/server';
import { notFound } from 'next/navigation';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { getTaxonomiesItem, getBreadcrumbsByPermalink } from '@castlery/modules-cms-domain/server';
import { EcEnv } from '@castlery/config';
import { createMetadata } from '@castlery/seo';
import { CategoryItem } from '@castlery/types';
import { Metadata } from 'next';
import { PlpPageClient } from './page-client';
import { cache } from 'react';
import { CategoryDyTagServer } from '@castlery/modules-composite-components';

export const dynamic = 'force-dynamic';

/**
 * Generate metadata for the CLP page based on menu item data
 */
export async function generateMetadata({ params }: { params: { permalink: string[] } }): Promise<Metadata> {
  const menuItem: CategoryItem | null | undefined = await getCategoryItem(params);

  if (!menuItem) {
    return {
      title: 'Category Not Found',
      description: 'The category you are looking for does not exist.',
    };
  }

  const metadata = await createMetadata({
    title: menuItem.meta_title,
    description: menuItem.meta_description,
    keywords: menuItem.meta_keywords,
    image: menuItem.thumbnail || undefined,
    canonicalUrl: `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${menuItem.url}`,
    largeImagePreview: true,
  });

  return metadata;
}
/**
 * CLP (Category Landing Page) Route Handler
 *
 * Purpose: Renders category landing pages for menu-based categories
 *
 * Flow:
 * 1. Extract category URL from route params
 * 2. Fetch menu item data for the category
 * 3. Return 404 if menu item not found
 * 4. Render CategoryLandingPage component with the data
 */
export default async function Page({
  params,
  searchParams,
}: {
  params: { permalink: string[] };
  searchParams: { dyApiPreview?: string };
}) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.PLP, domain: BUSINESS_DOMAIN.SEARCH });

  const menuItem = await getCategoryItem(params);

  if (!menuItem) {
    notFound();
  }

  // 在page级别获取breadcrumbs，方便进行tracking
  const searchPermalink = menuItem.permalink;
  const breadcrumbs = await getBreadcrumbsByPermalink(searchPermalink);
  const breadcrumbsData = breadcrumbs.length ? breadcrumbs.map((i) => ({ name: i.name, url: i.url })) : [];
  breadcrumbsData.push({ name: menuItem.nameWithAll || menuItem.name, url: '' });

  // 使用 menuItem.query 作为 queryString
  const queryString = menuItem.query || undefined;

  const breadcrumbNames = breadcrumbsData.map((item) => item.name);

  return (
    <>
      <PlpPageClient permalinkList={params.permalink} link={searchPermalink} />
      <CategoryDyTagServer breadcrumbNames={breadcrumbNames} />
      <CategoryLandingPage
        categoryItem={menuItem!}
        breadcrumbs={breadcrumbsData}
        queryString={queryString}
        dyApiPreview={searchParams.dyApiPreview}
      />
    </>
  );
}

// ✅ 使用 cache() 避免在 generateMetadata 和 Page 中重复调用
// Next.js 会在同一个请求中缓存这个函数的结果
const getCategoryItem = cache(async (params: { permalink: string[] }): Promise<CategoryItem | null | undefined> => {
  const permalink = params.permalink.slice(0, 2).join('/');
  const menuItem = await getTaxonomiesItem(permalink);

  if (!menuItem) {
    return null;
  }

  return menuItem;
});
