import { FAQPage, WithContext } from 'schema-dts';
import { getStoryblokProductList } from '../fetch/api/api';
import { PageStoryblok } from '@castlery/types';
import { dyCampaignsFetcher } from '@castlery/modules-dy-domain';
import { logger } from '@castlery/observability';

const handleData = async (story: PageStoryblok, cookies: any) => {
  const storyblokProductList = {};
  const productIds = new Set<string>();
  const shopTheLookItemIds = new Set<string>();
  const dyCampaignsData: Record<string, any> = {};
  const dyCampaignPromises: Promise<void>[] = [];
  let hasFaqSchema = false;
  let jsonLd: WithContext<FAQPage> = {
    '@type': 'FAQPage',
    '@context': 'https://schema.org',
  };

  const cookieContext = { cookies };

  for (const item of story.content?.body || []) {
    if (item.component === 'detailed-product-listing' || item.component === 'simple-product-listing') {
      if (item?.product_id) {
        productIds.add(item.product_id);
      }
    }
    if (item.component === 'accordion') {
      jsonLd = {
        '@type': 'FAQPage',
        '@context': 'https://schema.org',
        mainEntity:
          item.items?.map((item: any) => ({
            '@type': 'Question',
            name: item.header,
          })) || [],
      };
      hasFaqSchema = true;
    }
    if (item.component === 'detailed-listing' || item.component === 'simple-listing') {
      if (item.items && item.items.length > 0) {
        item.items
          .filter(
            (subItem: any) =>
              subItem.component === 'detailed-product-listing' || subItem.component === 'simple-product-listing'
          )
          .forEach((product: any) => {
            if (product.product_id) {
              productIds.add(product.product_id);
            }
          });
      }
    }
    if (item.component === 'Shop The Look Item') {
      if (item.hotspots && item.hotspots.length > 0) {
        item.hotspots.forEach((hotspot: any) => {
          if (hotspot.variant_id) {
            shopTheLookItemIds.add(hotspot.variant_id);
          }
        });
      }
    }

    if (item.component === 'full-width-banner') {
      if (item.banner_selector_name !== '') {
        // 将 dyCampaignsFetcher 调用添加到 promises 数组中
        const campaignPromise = (async () => {
          try {
            const res = await dyCampaignsFetcher(
              {
                campaignNames: [item.banner_selector_name],
                query: { dyApiPreview: 'true' },
              },
              cookieContext
            );

            // 检查 res 是否是有效的 Response 对象
            if (res && typeof res === 'object' && 'ok' in res) {
              const response = res as Response;
              if (response.ok) {
                const data = await response.json();
                if (data.choices.length > 0) {
                  const choice = data.choices[0];
                  if (choice?.variations?.[0]?.payload?.data) {
                    dyCampaignsData[item.banner_selector_name] = choice?.variations?.[0]?.payload?.data;
                  }
                }
                // 你可以在这里处理返回的数据
                // data.choices 包含活动数据
                // data.cookies 包含需要设置的 cookies
              } else {
                logger.error('Failed to fetch DY campaign', {
                  status: response.status,
                  statusText: response.statusText,
                  campaignName: item.banner_selector_name,
                });
              }
            } else {
              logger.info('DY Campaign response is empty or invalid', { campaignName: item.banner_selector_name });
            }
          } catch (error) {
            logger.error('Error fetching DY campaign', { error, campaignName: item.banner_selector_name });
          }
        })();

        dyCampaignPromises.push(campaignPromise);
      }
    }
  }

  // 使用 Promise.all 并行执行所有异步请求
  const asyncPromises: Promise<any>[] = [];

  // 添加 getStoryblokProductList 请求
  if (productIds.size > 0) {
    asyncPromises.push(getStoryblokProductList([...productIds] as string[]));
  }

  // 添加所有 dyCampaignsFetcher 请求
  asyncPromises.push(...dyCampaignPromises);

  // 等待所有异步请求完成
  if (asyncPromises.length > 0) {
    const results = await Promise.all(asyncPromises);

    // 处理 getStoryblokProductList 的结果
    if (productIds.size > 0) {
      const products = results[0];
      Object.assign(storyblokProductList, products);
    }
  }

  const shopTheLookItemsStr = [...shopTheLookItemIds].join(',');

  return {
    storyblokProductList,
    shopTheLookItemsStr,
    hasFaqSchema,
    jsonLd,
    dyCampaignsData,
  };
};

export { handleData };
