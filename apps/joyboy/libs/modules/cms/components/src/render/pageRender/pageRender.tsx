'use client';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { Stack, useBreakpoints } from '@castlery/fortress';
import { useEffect, useState } from 'react';
import { componentKeyMap } from '../../lib';
import { sectionClassSelectorName } from '../../lib/sticky-bar/sticky-bar';
import type { ISbStoryData } from '@storyblok/react';
// import { useAppDispatch } from '@castlery/shared-redux-store';
// import { MarkTypes, StoryblokRichText, StoryblokStory } from '@storyblok/react/rsc';
interface Story {
  _uid: string;
  content: Record<string, any>;
  component: string;
  slug: string;
  anchor?: Record<string, any>[];
}
export const StoryBlokStory = ({ blok, scrollMarginTop }: { blok: Story; scrollMarginTop?: number }) => {
  const { anchor = [] } = blok;
  const anchorId = anchor && anchor[0]?.component === componentKeyMap.anchorBlokV2 ? anchor[0]?.anchor_id : '';
  const marginTop = typeof scrollMarginTop === 'number' ? `${scrollMarginTop}px` : '90px';
  return anchorId ? (
    <Stack
      key={blok?._uid}
      id={anchorId || blok._uid}
      className={sectionClassSelectorName}
      sx={{ scrollMarginTop: marginTop /* 设置为导航栏的高度 */ }}
    >
      <StoryblokServerComponent blok={blok} />
    </Stack>
  ) : (
    <StoryblokServerComponent blok={blok} key={blok._uid} />
  );
};

export const storiesWrapperClasses = {
  root: 'stories-wrapper',
};
export interface StoryblokWidgetsProps {
  stories: Story[];
  uid: string;
  scrollMarginTop?: number; //100=>'100px'
}

// TODOS @carolzhang @wcdaren确认是否删除这个组件
export const StoryblokWidgets = ({ stories, uid, scrollMarginTop }: StoryblokWidgetsProps) => {
  const [content, setContent] = useState<Story[] | null>(null);

  useEffect(() => {
    // Initialize the Storyblok JS Bridge
    const { StoryblokBridge, location } = window;
    if (StoryblokBridge) {
      const storyblokInstance = new StoryblokBridge();
      storyblokInstance.on(['published', 'change'], (event) => {
        if (!event.slugChanged) {
          // reload page if save or publish is clicked
          location.reload(true);
        }
      });
      storyblokInstance.on('input', (event) => {
        // Access currently changed but not yet saved content via:
        if (event?.story?.content) {
          setContent((pre) => {
            const newContent = event.story.content.body?.map((story) => {
              if (story.data_source) {
                const data = pre?.find((item) => item._uid === story._uid)?.data_source;
                return { ...story, data_source: data };
              }
              return story;
            });
            return newContent;
          });
        }
      });
    }
  }, []);

  return (
    <Stack {...storyblokEditable} key={uid} className={storiesWrapperClasses.root}>
      {Array.isArray(content)
        ? content.map((story) => {
            return <StoryBlokStory key={story._uid} blok={story} scrollMarginTop={scrollMarginTop} />;
          })
        : stories.map((story) => {
            return <StoryBlokStory key={story._uid} blok={story} scrollMarginTop={scrollMarginTop} />;
          })}
    </Stack>
  );
};

export const SbPage = ({
  blok,
  scrollMarginTop,
  maxWidth,
  children,
  useInPLP = false,
  position,
}: {
  blok: ISbStoryData['content'];
  scrollMarginTop?: number;
  maxWidth?: number;
  children?: React.ReactNode;
  useInPLP?: boolean;
  position?: 'body_section' | 'bottom_section';
}) => {
  const [content, setContent] = useState<ISbStoryData['content']>(blok);
  const { desktop } = useBreakpoints();
  // TODO @wcdaren 我总感觉这个实现就很奇怪
  // 这个是为了现在sb的实时渲染
  // 以后应该设计 一个 preview 模式来处理 https://github.com/vercel/next.js/blob/canary/examples/cms-storyblok/pages/api/preview.js
  useEffect(() => {
    // Initialize the Storyblok JS Bridge
    const { StoryblokBridge, location } = window;
    if (StoryblokBridge) {
      const storyblokInstance = new StoryblokBridge();
      storyblokInstance.on(['published', 'change'], (event) => {
        if (!event?.slugChanged) {
          // reload page if save or publish is clicked
          location.reload();
        }
      });
      storyblokInstance.on('input', (event) => {
        // Access currently changed but not yet saved content via:
        if (event?.story?.content) {
          if (position === 'body_section') {
            setContent({ body: event?.story?.content?.body_section || [] });
          } else if (position === 'bottom_section') {
            setContent({ body: event?.story?.content?.bottom_section || [] });
          } else {
            setContent(event?.story?.content);
          }
        }
      });
    }
  }, []);

  return (
    <main
      {...storyblokEditable(content)}
      style={{
        width: '100vw',
        minHeight: useInPLP ? 'auto' : '100vh',
        maxWidth: desktop ? (maxWidth ? maxWidth : 1728) : '100vw',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {/* {children} */}
      {content?.body?.map((nestedBlok: Story) => {
        const anchorId =
          nestedBlok.anchor &&
          Array.isArray(nestedBlok.anchor) &&
          nestedBlok.anchor?.[0]?.component === componentKeyMap.anchorBlokV2
            ? nestedBlok.anchor[0]?.anchor_id
            : '';

        return (
          <Stack
            key={nestedBlok._uid}
            id={anchorId || nestedBlok._uid} // Set the component anchor configured in cms
            className="story_section" // 用于滚动时定位，不可删除, explain: PM需要在页面滚动时，自动选中当前出现在视窗中的section对应的导航栏标题
            sx={{
              //Used to set the offset when scrolling
              //so that the content is not covered by the navigation bar
              scrollMarginTop:
                typeof scrollMarginTop === 'number' ? `${scrollMarginTop}px` : '90px' /* 设置为导航栏的高度 */,
            }}
          >
            <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
          </Stack>
        );
      })}
    </main>
  );
};

export const SbPageWithData = ({ blok }: { blok: ISbStoryData['content'] }) => {
  return <SbPage blok={blok} />;
};

// {content.body.map((nestedBlok: Story) => {
//   const anchorId =
//     nestedBlok.anchor &&
//     Array.isArray(nestedBlok.anchor) &&
//     nestedBlok.anchor?.[0]?.component === componentKeyMap.anchorBlokV2
//       ? nestedBlok.anchor[0]?.anchor_id
//       : '';

//   return (
//     <Stack
//       key={blok?._uid}
//       id={anchorId || blok._uid} // Set the component anchor configured in cms
//       className="story_section" // 用于滚动时定位，不可删除, explain: PM需要在页面滚动时，自动选中当前出现在视窗中的section对应的导航栏标题
//       sx={{
//         //Used to set the offset when scrolling
//         //so that the content is not covered by the navigation bar
//         scrollMarginTop:
//           typeof scrollMarginTop === 'number' ? `${scrollMarginTop}px` : '90px' /* 设置为导航栏的高度 */,
//       }}
//     >
//       <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
//     </Stack>
//   );
// })}
