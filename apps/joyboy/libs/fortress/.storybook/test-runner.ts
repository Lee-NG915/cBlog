import { getStoryContext, type TestRunnerConfig } from '@storybook/test-runner';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { waitForPageReady } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

const customSnapshotsDir = `${process.cwd()}/__snapshots__`;
const skipSnapshots = process.env.SKIP_SNAPSHOTS === 'true';

const DEFAULT_VIEWPORT_SIZE = { width: 1280, height: 720 };

const RESOURCE_TIMEOUT = 2000;

export const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });

    jest.setTimeout(30000);
  },
  async preVisit(page, story) {
    if (await page.evaluate(() => !('takeSnapshot' in window))) {
      await page.exposeBinding('takeSnapshot', async ({ page }) => {
        const elementHandler = await page.$('#storybook-root');
        const innerHTML = await elementHandler?.innerHTML();
        expect(innerHTML).toMatchSnapshot();
      });
    }

    if (await page.evaluate(() => !('takeScreenshot' in window))) {
      await page.exposeBinding('takeScreenshot', async ({ page }) => {
        const image = await page.locator('#storybook-root').screenshot();
        expect(image).toMatchImageSnapshot();
      });
    }
    // const context = await getStoryContext(page, story); //获取当前故事的上下文信息，包括参数、全局配置等。
    // const viewportName = context.parameters?.viewport?.defaultViewport; //从上下文中提取当前故事的默认视口名称。
    // const viewportParameter = MINIMAL_VIEWPORTS[viewportName]; // 根据 viewportName 从 MINIMAL_VIEWPORTS 中获取具体的视口配置。

    try {
      const context = await getStoryContext(page, story);
      const viewportName = context.parameters?.viewport?.defaultViewport;

      if (viewportName && MINIMAL_VIEWPORTS[viewportName]) {
        const viewportParameter = MINIMAL_VIEWPORTS[viewportName];

        if (viewportParameter?.styles) {
          const viewportStyles =
            typeof viewportParameter.styles === 'function' ? viewportParameter.styles({}) : viewportParameter.styles;

          const viewportSize = {
            width: parseInt(viewportStyles.width as string) || DEFAULT_VIEWPORT_SIZE.width,
            height: parseInt(viewportStyles.height as string) || DEFAULT_VIEWPORT_SIZE.height,
          };

          await page.setViewportSize(viewportSize);
          console.log(`[${story.id}] 设置视口: ${viewportSize.width}x${viewportSize.height}`);
        }
      } else {
        console.warn(`[${story.id}] 视口设置失败，使用默认视口`);
        await page.setViewportSize(DEFAULT_VIEWPORT_SIZE);
      }
    } catch (error) {
      console.warn(`[${story.id}] 视口设置失败，使用默认视口`, error);
      await page.setViewportSize(DEFAULT_VIEWPORT_SIZE);
    }

    await waitForPageReady(page);

    await page.waitForLoadState('networkidle', { timeout: RESOURCE_TIMEOUT }).catch(() => {
      console.warn(`[${story.id}] 等待网络空闲超时，继续测试`);
    });
  },
  async postVisit(page, context) {
    if (skipSnapshots) {
      console.log(`[${context.id}] 跳过快照测试`);
      return;
    }

    try {
      const { parameters } = await getStoryContext(page, context);

      if (parameters?.tests?.disableSnapshots) {
        console.log(`[${context.id}] 故事配置禁用快照测试`);
        return;
      }

      await waitForPageReady(page);

      await page.waitForTimeout(1000);

      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot({
        customSnapshotsDir,
        customSnapshotIdentifier: context.id,
        failureThreshold: 0.03,
        failureThresholdType: 'percent',
      });

      console.log(`[${context.id}] 快照测试通过`);
    } catch (error) {
      console.error(`[${context.id}] 快照测试失败:`, error);
      throw error;
    }
  },
};
export default config;
