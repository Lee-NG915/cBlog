export interface StoryblokConfig {
  accessToken: string;
  useRedux?: boolean;
  components?: any;
}

export type StoryblokDataType = {
  [key: string]: any; // 或者更具体的类型定义
};

export type StoryblokPageRawMetaItemType = {
  title: string;
  description: string;
  keywords: string;
  notIndexed?: boolean;
};

export type StoryblokPageRawTimerItemType = {
  published_at?: string;
  ended_at?: string;
};

export type StoryblokPageRawItemType = {
  path: string;
  slug: string;
  full_slug: string;
  name: string;
  content: {
    meta?: StoryblokPageRawMetaItemType[];
    timer?: StoryblokPageRawTimerItemType[];
  };
};

export type StoryblokPageItemType = {
  key: string;
  url: string;
  query: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt?: string;
  endedAt?: string;
  notIndexed?: boolean;
};
