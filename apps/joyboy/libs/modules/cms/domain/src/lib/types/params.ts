export interface FetchInServerParams {
  slugArray: string[];
  refreshTime?: number;
}

export interface SetStoryblokDataParams {
  slug: string;
  data: Record<string, any>;
}
