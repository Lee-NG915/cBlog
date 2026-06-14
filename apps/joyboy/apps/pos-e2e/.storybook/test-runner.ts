import { type TestRunnerConfig, getStoryContext } from '@storybook/test-runner';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';

const DEFAULT_VIEWPORT_SIZE = { width: 1280, height: 720 };

const config: TestRunnerConfig = {
  async preVisit(page, story) {
    // page: 代表测试中使用的浏览器页面对象，通常是 Playwright 或 Puppeteer 提供的对象
    // story: 当前测试的 Storybook 故事对象。
    const context = await getStoryContext(page, story); //获取当前故事的上下文信息，包括参数、全局配置等。
    const viewportName = context.parameters?.viewport?.defaultViewport; //从上下文中提取当前故事的默认视口名称。
    const viewportParameter = MINIMAL_VIEWPORTS[viewportName]; // 根据 viewportName 从 MINIMAL_VIEWPORTS 中获取具体的视口配置。

    if (viewportParameter && viewportParameter.styles && typeof viewportParameter.styles === 'object') {
      // 使用 reduce 函数，将 viewportParameter.styles 对象的每一项转换为数字形式的 width 和 height。
      const viewportSize = Object.entries(viewportParameter.styles).reduce(
        (acc, [screen, size]) => ({
          ...acc,
          // make sure your viewport config in Storybook only uses numbers, not percentages
          [screen]: parseInt(size),
        }),
        {} as { width: number; height: number }
      );

      page.setViewportSize(viewportSize); //根据计算出的视口尺寸，设置页面的视口大小。
    } else {
      page.setViewportSize(DEFAULT_VIEWPORT_SIZE); // 如果没有找到有效的视口配置，使用默认的视口尺寸 DEFAULT_VIEWPORT_SIZE。
    }
  },
};
export default config;
