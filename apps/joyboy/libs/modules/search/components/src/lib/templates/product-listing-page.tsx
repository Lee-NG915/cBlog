import React from 'react';
import { SearchViewSuspenseWrapper } from '../search-view/search-view-suspense-wrapper';
import { Banner } from '../banner';
import { SalesPageStoryblok, VisualSalePageStoryblok } from '@castlery/types';
import { PLPBreadcrumbs } from '@castlery/shared-components';
import { SeoFaqs } from './common/seo-faqs';
import { BodySectionBanner } from '../banner/body-section-banner';
import { BottomSectionBanner } from '../banner/bottom-section-banner';
import { VisualBodySectionBanner } from '../banner/visual-body-section-banner';
import { VisualBottomSectionBanner } from '../banner/visual-bottom-section-banner';
import { JsonLd } from '@castlery/seo';
import { EcEnv } from '@castlery/config';
import { Container } from '@castlery/fortress';

interface ProductListingPageProps {
  salePageData?: SalesPageStoryblok;
  visualSalePageData?: VisualSalePageStoryblok;
  dyApiPreview?: string; // DY API preview ID for testing campaigns
}
const mainLink = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`;

export function ProductListingPage({ salePageData, visualSalePageData, dyApiPreview }: ProductListingPageProps) {
  const currentPageName = salePageData?.banner_title || visualSalePageData?.name || '';
  const currentPagePermalink = salePageData?.permalink || visualSalePageData?.permalink || '';
  const useSbBodySection = salePageData?.body_section?.length || visualSalePageData?.body_section?.length;
  const queryString = salePageData?.query || visualSalePageData?.query || '';
  const seotitle =
    salePageData?.banner_title ||
    salePageData?.name ||
    visualSalePageData?.banner_title ||
    visualSalePageData?.name ||
    '';
  const seoContent = salePageData?.seo_content || visualSalePageData?.seo_content || '';
  const faqs = salePageData?.faqs || visualSalePageData?.faqs || [];
  // Extract deadline from first query_deliver_before item (only one expected)
  const queryDeliverBeforeItems = salePageData?.query_deliver_before || visualSalePageData?.query_deliver_before || [];
  const queryDeliverBeforeDeadline = queryDeliverBeforeItems.length > 0 ? queryDeliverBeforeItems[0]?.deadline : null;
  // const queryString = `?overall_sit_rating%5Bmin%5D=3&overall_sit_rating%5Bmax%5D=4`;
  // const queryString = `?length%5Bmin%5D=66&length%5Bmax%5D=123&price%5Bmin%5D=667&price%5Bmax%5D=2252&seat_depth_rating%5Bmin%5D=3&seat_depth_rating%5Bmax%5D=4&seat_softness_rating%5Bmin%5D=2&seat_softness_rating%5Bmax%5D=3&overall_sit_rating%5Bmin%5D=2&overall_sit_rating%5Bmax%5D=3&seat_height_rating%5Bmin%5D=3&seat_height_rating%5Bmax%5D=4`;
  // const queryString = `?overall_sit_rating%5Bmin%5D=3&overall_sit_rating%5Bmax%5D=4`;
  // const queryString = `?color%5B0%5D=blue`;
  // const queryString = `?category%5B0%5D=storage&tags%5B0%5D=new`;
  // const queryString = `?material_filter%5B0%5D=Fabric&color%5B0%5D=blue&category%5B0%5D=furniture-sets&length%5Bmin%5D=177&length%5Bmax%5D=453&seat_depth_rating%5Bmin%5D=4&seat_depth_rating%5Bmax%5D=5`;
  // const queryString = `?category[0]=storage&tags[0]=new`;
  // const queryString = `overall_sit_rating[min]=2&overall_sit_rating[max]=3&seat_depth_rating[min]=3&seat_depth_rating[max]=5&seat_height_rating[min]=3&seat_height_rating[max]=4&seat_softness_rating[min]=3&seat_softness_rating[max]=3&fabric_feature[0]=Machine-washable`;

  // 🔧 在template内部构建currentUrl（用于DY location）
  // salePageData.path 或 visualSalePageData.path 已包含完整路径（如 /sg/sale）
  const currentUrl =
    salePageData?.path || visualSalePageData?.path
      ? `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${
          salePageData?.path || visualSalePageData?.path
        }`
      : undefined;

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
      <Container>
        <PLPBreadcrumbs currentPageName={currentPageName} items={[]} />
      </Container>
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
            {
              '@type': 'ListItem',
              position: 2,
              name: currentPageName,
            },
          ],
        }}
      />
      <Container disableGutters>
        {!useSbBodySection && (
          <Banner
            title={salePageData?.banner_title}
            description={salePageData?.banner_intro}
            desktopImage={salePageData?.banner_background_image}
            mobileImage={salePageData?.banner_background_image_mobile}
            backgroundColor={salePageData?.background_color}
            countdownDeadline={salePageData?.countdown_deadline}
            countdownColor={salePageData?.countdown_color}
            showOverlay={true}
            showBanner
            bannerData={salePageData}
          />
        )}

        {salePageData?.body_section && salePageData.body_section.length > 0 && (
          <BodySectionBanner sections={salePageData.body_section} />
        )}

        {visualSalePageData?.body_section && visualSalePageData.body_section.length > 0 && (
          <VisualBodySectionBanner sections={visualSalePageData.body_section} />
        )}
      </Container>

      <SearchViewSuspenseWrapper
        queryString={queryString}
        categoryPermalink={currentPagePermalink}
        queryDeliverBeforeDeadline={queryDeliverBeforeDeadline}
        currentUrl={currentUrl}
        breadcrumbs={[{ name: currentPageName }]}
        dyApiPreview={dyApiPreview}
      />

      {/* Search View with query string parsing handled by SearchViewServerWrapper */}
      <SeoFaqs title={seotitle} seoContent={seoContent} faqs={faqs} />
      <Container>
        {salePageData?.bottom_section && salePageData.bottom_section.length > 0 && (
          <BottomSectionBanner sections={salePageData.bottom_section} />
        )}

        {visualSalePageData?.bottom_section && visualSalePageData.bottom_section.length > 0 && (
          <VisualBottomSectionBanner sections={visualSalePageData.bottom_section} />
        )}
      </Container>
    </Container>
  );
}
