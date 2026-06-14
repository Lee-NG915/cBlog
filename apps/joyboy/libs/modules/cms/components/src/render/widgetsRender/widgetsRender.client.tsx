'use client';

import { useEffect, useState } from 'react';
import type { ISbStoryData } from '@storyblok/react';

export const SbWidgetsClient = ({ blok }: { blok: ISbStoryData['content'] }) => {
  const [content, setContent] = useState<ISbStoryData['content']>(blok);

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
          setContent(event?.story?.content);
          // 更新到 redux 中
        }
      });
    }
  }, []);

  return null;
};
