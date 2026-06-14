import { EcEnv } from '@castlery/config';
import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import type { StoryblokClient } from '@storyblok/react';
import { SbService } from './sbService';

/**
 * 创建一个不依赖 components 的 SbService 实例
 * 用于 composite-components 等不能直接导入 cms-components 的场景
 */
export function createSbService(): SbService {
  const getStoryblokApi = storyblokInit({
    accessToken: EcEnv.NEXT_PUBLIC_STORYBLOK_TOKEN,
    use: [apiPlugin],
    components: {}, // 不传入 components，避免循环依赖
    bridge: true,
    apiOptions: {},
  }) as () => StoryblokClient;

  return new SbService({
    client: getStoryblokApi(),
  });
}
