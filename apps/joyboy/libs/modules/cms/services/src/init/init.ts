// import { storyblokInit, apiPlugin } from '@storyblok/react';
// import { fetchFromKnightServer } from '../fetch';
// import { fetchAllStoriesByContentType, fetchFromStoryblok, fetchFromStoryblokPage } from '../fetch';
// import { FetchInServerParams, SetStoryblokDataParams, StoryblokConfig } from '../types';
// class StoryblokService {
//   private config: StoryblokConfig;
//   private initialized = false;

//   constructor(config: StoryblokConfig) {
//     this.config = config;
//     this.initialized = false;
//     this.init();
//   }
//   private init(): void {
//     storyblokInit({
//       accessToken: this.config.accessToken,
//       use: [apiPlugin],
//       components: this.config?.components,
//     });
//     this.initialized = true;
//   }

//   public async fetchDataInKnightServer({ slugArray }: FetchInServerParams): Promise<SetStoryblokDataParams[] | null> {
//     if (!this.initialized) {
//       this.init();
//     }
//     const result = await fetchFromKnightServer({ slugArray });
//     // console.log(result, "fetchDataInKnightServer result")
//     return result;
//     // if (this.config.useRedux && result) {
//     // 	console.log("codes running in here");
//     // 	// this.dispatch(setStoryblokData(result));
//     // }
//   }

//   public async fetchDataInStoryblok({ slugArray }: FetchInServerParams): Promise<SetStoryblokDataParams[] | null> {
//     if (!this.initialized) {
//       this.init();
//     }
//     const result = await fetchFromStoryblok({ slugArray });
//     return result;
//   }

//   public async fetchPageInStoryblok({ contentType }: { contentType: string }): Promise<SetStoryblokDataParams[] | []> {
//     if (!this.initialized) {
//       this.init();
//     }
//     const result = await fetchAllStoriesByContentType({ contentType });
//     const tempArr: SetStoryblokDataParams[] = [];
//     tempArr.push({
//       slug: contentType,
//       data: result,
//     });
//     return tempArr;
//   }

//   public async fetchDataInStoryblokPage({ slugArray }: FetchInServerParams): Promise<SetStoryblokDataParams[] | null> {
//     if (!this.initialized) {
//       this.init();
//     }
//     const result = await fetchFromStoryblokPage({ slugArray });
//     return result;
//   }
// }

// export { StoryblokService };
