// import { StoryblokService, withServerSideRendering } from '@castlery/modules-cms-services';
// import { Page } from './storyblokPage';
// import { WebGlobalHead } from '@castlery/modules-product-components';
// import { components } from '@castlery/modules-cms-components';
// import React from 'react';

// const StoryblokPage = async ({ path, slug }) => {
//   const storyblokInstance = new StoryblokService({
//     accessToken: 'CdPkaLkSglxWM6yKzg6d3Att',
//     components,
//   });
//   const ServerSideMenu = withServerSideRendering({
//     ClientComponent: WebGlobalHead,
//     requestArr: ['/story_bloks/menu', '/taxonomies/menu'],
//   });
//   const story = await storyblokInstance.fetchDataInStoryblokPage({ slugArray: [slug] });
//   if ((story as any)?.status === 'rejected') {
//     throw new Error((story as any)?.reason);
//   }
//   return (
//     <>
//       <ServerSideMenu />
//       <Page params={{ rest: [path] }} blok={story[0].content} />
//     </>
//   );
//   // return <StoryblokWidgets story={story[0]} />;
// };

// export default StoryblokPage;
