'use client';
import React, { useState, useEffect, useRef } from 'react';
import { enterApp } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { Container, Stack, useBreakpoints } from '@castlery/fortress';
import { GeneralBreadcrumbs } from '@castlery/shared-components';
import { EcEnv, WEB_PAGE_NAMES } from '@castlery/config';
import BlogBanner from './components/banner/banner';
import BlogDisplayList from './components/blog-display-list/blog-display-list';
import BlogPagination from './components/blog-pagination/blog-pagination';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';

export const PageClient = () => {
  const dispatch = useAppDispatch();
  const hasTrackedPageView = useRef(false);
  useEffect(() => {
    dispatch(
      enterApp({
        page: 'Blog',
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (!hasTrackedPageView.current) {
      dispatch(EVENT_COMMON_PAGE_VIEW({ pageName: WEB_PAGE_NAMES.BLOG_LIST_PAGE }));
      hasTrackedPageView.current = true;
    }
  }, [dispatch]);

  return <></>;
};

export type BlogListType = {
  key: string;
  bannerBackgroundImage: string;
  name: string;
  url: string;
  publishedAt: string;
};

export const BlogList = ({ blogList }: { blogList: BlogListType[] }) => {
  const [realBlogList, setRealBlogList] = useState<BlogListType[]>([]);
  const { desktop } = useBreakpoints();

  useEffect(() => {
    setRealBlogList(blogList);
  }, [blogList]);

  return (
    <>
      <link
        rel="canonical"
        href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/blog`}
      />
      <Container
        sx={{
          minHeight: '100vh',
          ...(!desktop && { padding: '0 !important' }),
        }}
      >
        <GeneralBreadcrumbs
          breadcrumbs={[
            {
              label: 'Blog',
              link: '/blog',
            },
          ]}
        />

        {realBlogList?.length !== 0 && <BlogBanner />}
        {realBlogList?.length !== 0 && (
          <Stack
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              ...(desktop && { margin: '60px auto 0', paddingLeft: '32px', paddingRight: '32px' }),
            }}
          >
            <BlogDisplayList realBlogList={realBlogList} />
            <Stack
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <BlogPagination
                onListUpdate={(res) => {
                  setRealBlogList([...realBlogList, ...res]);
                }}
              />
            </Stack>
          </Stack>
        )}
      </Container>
    </>
  );
};
