import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { Box, Stack } from '@castlery/fortress';
import { componentKeyMap } from '../../lib';
import type { ISbStoryData } from '@storyblok/react';

export const SbWidgetsServer = async ({
  blok,
  scrollMarginTop,
  maxWidth,
  ...rest
}: {
  blok: ISbStoryData['content'];
  scrollMarginTop?: number;
  maxWidth?: number;
  [key: string]: any;
}) => {
  return (
    <Box component="main" {...storyblokEditable(blok)}>
      {blok.body?.map((nestedBlok: ISbStoryData['content']) => {
        const anchorId =
          nestedBlok.anchor &&
          Array.isArray(nestedBlok.anchor) &&
          nestedBlok.anchor?.[0]?.component === componentKeyMap.anchorBlokV2
            ? nestedBlok.anchor[0]?.anchor_id
            : '';

        return (
          <Stack
            key={blok._uid}
            id={anchorId || blok._uid} // Set the component anchor configured in cms
            className="story_section" // 用于滚动时定位，不可删除, explain: PM需要在页面滚动时，自动选中当前出现在视窗中的section对应的导航栏标题
            sx={{
              //Used to set the offset when scrolling
              //so that the content is not covered by the navigation bar
              scrollMarginTop:
                typeof scrollMarginTop === 'number' ? `${scrollMarginTop}px` : '90px' /* 设置为导航栏的高度 */,
            }}
          >
            <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} {...rest} />
          </Stack>
        );
      })}
    </Box>
  );
};
