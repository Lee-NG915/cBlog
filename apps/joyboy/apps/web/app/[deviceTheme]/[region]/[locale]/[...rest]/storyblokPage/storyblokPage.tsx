// 'use client';

// import React, { useEffect } from 'react';
// import { Container, Stack } from '@castlery/fortress';
// import { StoryblokWidgets } from '@castlery/modules-cms-services';

// export type PageProps = {
//   path: string;
//   blok: {
//     _uid?: string;
//     meta?: Array<{
//       title?: string;
//       description?: string;
//       keywords?: string;
//     }>;
//     breadcrumb?: string;
//     body?: Array<{
//       _uid: string;
//     }>;
//   };
// };

// const Page = ({ path, blok }: PageProps) => {
//   const { _uid, body } = blok;
//   // const { title, description, keywords } = meta?.[0] || {};

//   useEffect(() => {
//     // do something
//   }, []);

//   return (
//     <Container disableGutters>
//       <Stack>
//         <StoryblokWidgets stories={body} uid={_uid} />
//       </Stack>
//     </Container>
//   );
// };

// export { Page };
