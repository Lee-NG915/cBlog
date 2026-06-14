/**
 * E2E template — add_to_cart business event.
 *
 * 复制到目标项目后修改:
 *   - BASE_URL：staging / preview 环境
 *   - PDP_PATH / ADD_TO_CART_SELECTOR：选择器
 *   - META_CAPI_HOST：Meta CAPI gateway hostname
 *
 * 该文件不会在 examples/tracking-event-model-demo 内被 vitest 拾起 ——
 * vitest.config.ts 的 include 限定在 tests 目录下，e2e/ 被排除。
 */
import { expect, test, type Request } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const PDP_PATH = '/products/linen-sofa';
const ADD_TO_CART_SELECTOR = '[data-testid="add-to-cart-button"]';
const META_CAPI_HOST = 'graph.facebook.com';

interface GADataLayerEntry {
  event?: string;
  event_id?: string;
  ecommerce?: {
    currency?: string;
    value?: number;
    items?: Array<{ item_id: string; quantity: number; price: number }>;
  };
}

test.describe('add_to_cart · E2E contract', () => {
  test('fires GA + Meta with shared event_id when marketing consent granted', async ({ page }) => {
    // 1. 设置 marketing consent（替换为目标站点的真实 consent cookie / localStorage 写法）
    await page.context().addCookies([{ name: 'consent_marketing', value: '1', url: BASE_URL }]);

    // 2. 收集 Meta CAPI 请求
    const metaRequests: Request[] = [];
    page.on('request', (req) => {
      if (req.url().includes(META_CAPI_HOST) && req.method() === 'POST') {
        metaRequests.push(req);
      }
    });

    // 3. 真实操作
    await page.goto(`${BASE_URL}${PDP_PATH}`);
    await page.click(ADD_TO_CART_SELECTOR);

    // 4. dataLayer 断言（GA 侧）
    await expect
      .poll(async () =>
        page.evaluate(
          () =>
            (window as unknown as { dataLayer?: GADataLayerEntry[] }).dataLayer?.filter(
              (e) => e?.event === 'add_to_cart'
            ).length ?? 0
        )
      )
      .toBe(1);

    const gaEntries = (
      await page.evaluate(() => (window as unknown as { dataLayer?: GADataLayerEntry[] }).dataLayer ?? [])
    ).filter((e) => e?.event === 'add_to_cart');

    expect(gaEntries[0].ecommerce?.value).toBeGreaterThan(0);
    expect(gaEntries[0].ecommerce?.items?.[0]).toMatchObject({
      item_id: expect.any(String),
      quantity: expect.any(Number),
    });

    // 5. Meta 网络请求断言
    await expect.poll(() => metaRequests.length).toBe(1);
    const metaBody = metaRequests[0].postDataJSON();
    expect(metaBody?.event_name).toBe('AddToCart');
    expect(metaBody?.custom_data?.content_ids).toEqual([gaEntries[0].ecommerce?.items?.[0].item_id]);

    // 6. 跨平台 dedupe 契约：GA event_id === Meta event_id
    expect(gaEntries[0].event_id).toBe(metaBody?.event_id);
  });

  test('consent gate: no Meta request when marketing consent missing', async ({ page }) => {
    await page.context().clearCookies();

    const metaRequests: Request[] = [];
    page.on('request', (req) => {
      if (req.url().includes(META_CAPI_HOST) && req.method() === 'POST') {
        metaRequests.push(req);
      }
    });

    await page.goto(`${BASE_URL}${PDP_PATH}`);
    await page.click(ADD_TO_CART_SELECTOR);

    // GA 不受 consent 闸门影响（通用追踪），但 Meta 必须被挡住
    await expect
      .poll(async () =>
        page.evaluate(
          () =>
            (window as unknown as { dataLayer?: GADataLayerEntry[] }).dataLayer?.filter(
              (e) => e?.event === 'add_to_cart'
            ).length ?? 0
        )
      )
      .toBe(1);

    // 给一点时间让任何延迟的网络请求发出
    await page.waitForTimeout(500);
    expect(metaRequests).toHaveLength(0);
  });
});
