/**
 * E2E template — order_purchased business event.
 *
 * 演示：
 *   1. 真实 checkout 流程跑完后，断言 GA purchase + Meta Purchase 都被发出；
 *   2. 同一订单刷新页面，不应该重复上报（验证 listener 内存 dedupe）；
 *   3. transaction_id（GA）来自 order.number，order_id（Meta）来自 order.id —— 二者不同。
 */
import { expect, test, type Request } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const META_CAPI_HOST = 'graph.facebook.com';

interface GADataLayerEntry {
  event?: string;
  event_id?: string;
  ecommerce?: {
    transaction_id?: string;
    value?: number;
    currency?: string;
    items?: Array<{ item_id: string; quantity: number; price: number }>;
  };
}

const collectMetaRequests = (page: import('@playwright/test').Page) => {
  const buffer: Request[] = [];
  page.on('request', (req) => {
    if (req.url().includes(META_CAPI_HOST) && req.method() === 'POST') {
      buffer.push(req);
    }
  });
  return buffer;
};

const readGAEvents = async (page: import('@playwright/test').Page, name: string) =>
  (await page.evaluate(() => (window as unknown as { dataLayer?: GADataLayerEntry[] }).dataLayer ?? [])).filter(
    (e) => e?.event === name
  );

/**
 * 演示用占位函数：把"如何在测试中走到 purchase 成功页"封装。
 * 真实项目里这里会调用 stripe test card、PayPal sandbox 等。
 */
const runHappyPathCheckout = async (page: import('@playwright/test').Page) => {
  await page.context().addCookies([{ name: 'consent_marketing', value: '1', url: BASE_URL }]);
  // TODO: 替换为目标站点的真实 add-to-cart + checkout + pay 流程
  await page.goto(`${BASE_URL}/products/linen-sofa`);
  await page.click('[data-testid="add-to-cart-button"]');
  await page.goto(`${BASE_URL}/checkout`);
  await page.fill('[data-testid="checkout-email"]', 'qa+e2e@example.com');
  await page.click('[data-testid="pay-with-test-card"]');
  await page.waitForURL(/\/order\/confirmation/);
};

test.describe('order_purchased · E2E contract', () => {
  test('fires GA purchase + Meta Purchase with correct id mapping', async ({ page }) => {
    const metaRequests = collectMetaRequests(page);

    await runHappyPathCheckout(page);

    const gaEvents = await readGAEvents(page, 'purchase');
    expect(gaEvents).toHaveLength(1);

    // GA transaction_id 来源于 order.number（用户可见单号）
    expect(gaEvents[0].ecommerce?.transaction_id).toMatch(/^[A-Z]{2}\d+/);
    expect(gaEvents[0].ecommerce?.value).toBeGreaterThan(0);
    expect(gaEvents[0].ecommerce?.items?.length).toBeGreaterThan(0);

    const purchaseRequest = metaRequests.find((r) => r.postDataJSON()?.event_name === 'Purchase');
    expect(purchaseRequest).toBeTruthy();
    const body = purchaseRequest!.postDataJSON();

    // Meta order_id 来源于 order.id（内部稳定 id），与 GA transaction_id 不同
    expect(body.custom_data.order_id).not.toBe(gaEvents[0].ecommerce?.transaction_id);

    // 跨平台 dedupe 契约：event_id 共享
    expect(body.event_id).toBe(gaEvents[0].event_id);
  });

  test('refreshing the confirmation page does not double-fire purchase', async ({ page }) => {
    const metaRequests = collectMetaRequests(page);

    await runHappyPathCheckout(page);

    const beforeRefresh = (await readGAEvents(page, 'purchase')).length;
    const beforeMeta = metaRequests.filter((r) => r.postDataJSON()?.event_name === 'Purchase').length;

    await page.reload();

    await page.waitForTimeout(800);
    const afterRefresh = (await readGAEvents(page, 'purchase')).length;
    const afterMeta = metaRequests.filter((r) => r.postDataJSON()?.event_name === 'Purchase').length;

    // listener dedupe by order.id 应保证刷新不重复上报
    expect(afterRefresh).toBe(beforeRefresh);
    expect(afterMeta).toBe(beforeMeta);
  });
});
