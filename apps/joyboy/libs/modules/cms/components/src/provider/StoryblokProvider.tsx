'use client';
import { getStoryblokApi } from '../storyblok';
import { PropsWithChildren } from 'react';

export function StoryblokProvider({ children }: PropsWithChildren) {
  getStoryblokApi();
  return children;
}
