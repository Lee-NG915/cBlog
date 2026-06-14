'use client';
import { Stack, useBreakpoints } from '@castlery/fortress';
import { SbPage } from '@castlery/modules-cms-components';
import { BlogBreadcrumbs, GeneralBreadcrumbs } from '@castlery/shared-components';
import React from 'react';
import { logger } from '@castlery/observability/client';

interface BlogPageType {
  content: any;
  helmetData: {
    pathname: string;
    title: string;
    metaTitle: string;
    description: string;
    keywords: string;
    image: string;
    name: string;
    published_time: string;
    modified_time: string;
  };
  storyblokProductList: any;
}

// 简单的错误边界组件
class BlogErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Blog page error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong loading this blog post.</h2>
          <button onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const BlogPageContent = ({ content, helmetData }: BlogPageType) => {
  const { desktop, tablet } = useBreakpoints();

  // 调试日志
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('BlogPageContent rendered with:', {
        contentSize: content ? JSON.stringify(content).length : 0,
        title: helmetData?.title,
        hasContent: !!content,
        hasHelmetData: !!helmetData,
      });
    }
  }, [content, helmetData]);

  // 数据验证
  if (!content || !helmetData) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('BlogPageContent: Missing required data', { content: !!content, helmetData: !!helmetData });
    }
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading blog content...</h2>
      </div>
    );
  }

  // 限制 title 长度，防止过长的标题导致问题
  const safeTitle = helmetData.title?.substring(0, 100) || '';

  return (
    <BlogErrorBoundary>
      <Stack
        sx={{
          alignItems: 'center',
        }}
      >
        <GeneralBreadcrumbs
          breadcrumbs={[
            {
              label: 'Blog',
              link: '/blog',
            },
            {
              label: safeTitle,
              link: '',
            },
          ]}
        />
      </Stack>
      <SbPage blok={content} maxWidth={1728} />
    </BlogErrorBoundary>
  );
};
