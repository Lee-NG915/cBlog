import { SearchViewSuspenseWrapper } from '../search-view/search-view-suspense-wrapper';
import { Container, Stack } from '@castlery/fortress';
import { Banner } from '../banner';
import { PLPBreadcrumbs } from '@castlery/shared-components';
import { JsonLd } from '@castlery/seo';
import { EcEnv } from '@castlery/config';
import React from 'react';

const mainLink = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`;

interface SearchResultsPageProps {
  dyApiPreview?: string;
}

export function SearchResultsPage({ dyApiPreview }: SearchResultsPageProps = {}) {
  // 🔧 在template内部构建currentUrl（用于DY location）
  // search页面的路径是固定的
  const currentUrl = `${mainLink}/search`;

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
        <PLPBreadcrumbs currentPageName="Search Results" />
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
                name: 'Search Results',
                item: `${mainLink}/search`,
              },
            ],
          }}
        />
      </Container>

      {/* Search Results Banner */}
      <Container disableGutters>
        <Banner
          title={'Search Results'}
          desktopImage={
            'https://res.cloudinary.com/castlery/image/upload/v1723060800/knight/category/banner/search.jpg'
          }
          mobileImage={
            'https://res.cloudinary.com/castlery/image/upload/v1648713427/knight/category/banner/search-mobile.jpg'
          }
        />
      </Container>

      {/* Search Results */}
      <SearchViewSuspenseWrapper
        currentUrl={currentUrl}
        breadcrumbs={[{ name: 'Search Results' }]}
        dyApiPreview={dyApiPreview}
        enableSearchResultsLoadedTracking={true}
      />
    </Container>
  );
}
