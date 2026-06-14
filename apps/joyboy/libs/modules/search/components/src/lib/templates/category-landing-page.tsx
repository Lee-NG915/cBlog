import type { ElasticsearchQuery } from 'searchkit';
import React from 'react';
import { SearchViewSuspenseWrapper } from '../search-view/search-view-suspense-wrapper';
import { Banner } from '../banner';
import { CategoryItem } from '@castlery/types';
import { DYRecommendationCarousel, PLPBreadcrumbs } from '@castlery/shared-components';
import { SeoFaqs } from './common/seo-faqs';
import { JsonLd } from '@castlery/seo';
import { EcEnv } from '@castlery/config';
import { Container } from '@castlery/fortress';

const mainLink = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`;

type CategoryLandingPageProps = {
  categoryItem: CategoryItem;
  hideCategoryRefinement?: boolean; // 是否隐藏分类筛选器，默认为false（collections页面传true）
  breadcrumbs: Array<{ name: string; url?: string }>; // 面包屑导航数据，由page级别传入
  queryString?: string; // 查询字符串，用于过滤产品
  dyApiPreview?: string; // DY API preview ID for testing campaigns
};

/**
 * CategoryLandingPage Component
 *
 * Purpose: Renders a category landing page with banner and filtered search results
 *
 * Features:
 * - Displays category banner with menu item data
 * - Shows filtered search results for the category using baseFilters
 * - 支持控制是否显示分类筛选器 (适用于categories页面显示，collections页面不显示)
 * - Renders Breadcrumbs derived from page-provided data
 * - Renders SEO content and FAQs from categoryItem
 * - 支持通过 queryString 参数进行产品过滤 (类似 ProductListingPage)
 */
export function CategoryLandingPage({
  categoryItem,
  hideCategoryRefinement = false,
  breadcrumbs = [],
  queryString,
  dyApiPreview,
}: CategoryLandingPageProps) {
  // Use permalink for search filtering if available, otherwise fallback to URL
  // Permalink is more reliable for Elasticsearch category filtering
  const searchPermalink = categoryItem.permalink === 'sofas/leather-sofas' ? '' : categoryItem.permalink;

  // CategoryLandingPage no longer generates baseFilters in frontend
  // Instead, pass categoryPermalink to route.ts for unified filter processing

  // 根据页面类型决定categoryFacetFilter：
  // - categories页面：传入当前分类的permalink，只显示该分类及其子分类
  // - collections页面：不传参数，让组件按默认逻辑处理
  const categoryFacetFilter = hideCategoryRefinement ? undefined : searchPermalink ? [searchPermalink] : undefined;

  // 🔧 在template内部构建currentUrl（用于DY location）
  // 使用categoryItem.url（已包含完整路径，如 /sg/categories/sofas）
  const currentUrl = categoryItem.url
    ? `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${categoryItem.url}`
    : undefined;

  const desktopImageRaw = categoryItem.image_with_text || categoryItem.image;
  const mobileImageRaw =
    categoryItem.image_with_text_responsive ||
    categoryItem.image_responsive ||
    categoryItem.image_with_text ||
    categoryItem.image;
  const desktopImage = desktopImageRaw || undefined;
  const mobileImage = mobileImageRaw || undefined;
  const showOverlay = !(categoryItem.image_with_text || categoryItem.image_with_text_responsive);

  return (
    <Container
      disableGutters
      sx={{
        // Disable smooth scrolling to prevent animated scroll restoration
        // when navigating back from PDP
        scrollBehavior: 'auto',
        '& *': {
          scrollBehavior: 'auto',
        },
      }}
    >
      {/* Breadcrumbs */}

      <Container>
        <PLPBreadcrumbs
          // currentPageName={categoryItem.name}
          items={breadcrumbs.length ? breadcrumbs.map((i) => ({ title: i.name, url: i.url })) : []}
        />
        <JsonLd
          code={{
            '@type': 'BreadcrumbList',
            '@context': 'https://schema.org',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${mainLink}/`,
              },
              ...(breadcrumbs?.length
                ? ([...breadcrumbs].map((breadcrumb, index) => ({
                    '@type': 'ListItem',
                    position: Number(index) + 2, // Home is position 1, so breadcrumbs start at 2
                    name: breadcrumb.name,
                    item: breadcrumb.url ? mainLink + breadcrumb.url : null,
                  })) as any)
                : []),
            ],
          }}
        />
      </Container>

      <Container disableGutters>
        <Banner
          title={categoryItem.name || undefined}
          description={categoryItem.description || undefined}
          desktopImage={desktopImage}
          mobileImage={mobileImage}
          backgroundColor={categoryItem.background_color || undefined}
          countdownDeadline={categoryItem.countdown_deadline || undefined}
          countdownColor={categoryItem.countdown_color || undefined}
          showOverlay={showOverlay}
          showBanner
        />
      </Container>

      {/* Search Results with both product filtering (baseFilters) and facets filtering (categoryFacetFilter) */}
      <SearchViewSuspenseWrapper
        categoryFacetFilter={categoryFacetFilter}
        hideCategoryRefinement={hideCategoryRefinement}
        categoryPermalink={searchPermalink}
        currentUrl={currentUrl}
        queryString={queryString}
        breadcrumbs={breadcrumbs}
        dyApiPreview={dyApiPreview}
        bottomContent={<DYRecommendationCarousel selector_name="PLP Reco" />}
      />

      {/* SEO Content & FAQ */}

      <SeoFaqs title={categoryItem.name} seoContent={categoryItem.seo_content} faqs={categoryItem.faqs as any} />
    </Container>
  );
}
