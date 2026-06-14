import { FAQPage, WithContext } from '@castlery/seo';
import { dyCampaignsFetcher } from '@castlery/modules-dy-domain';
import { logger } from '@castlery/observability/server';

// 工具函数：处理组件中的 items
export interface ProcessItemsResult {
  dyCampaignPromises: Promise<void>[];
  hasFaqSchema: boolean;
  jsonLd: WithContext<FAQPage>;
}

// 工具函数：处理 items 数组
export const processItems = (
  items: any[],
  cookieContext: { cookies: any },
  dyCampaignsData: Record<string, any>
): ProcessItemsResult => {
  const dyCampaignPromises: Promise<void>[] = [];
  let hasFaqSchema = false;
  let jsonLd: WithContext<FAQPage> = {
    '@type': 'FAQPage',
    '@context': 'https://schema.org',
  };

  for (const item of items) {
    const itemAny = item as any;

    // 处理 FAQ schema
    if (itemAny.component === 'Accordion' && itemAny.items) {
      hasFaqSchema = true;
      const faqItems = itemAny.items.map((faq: any) => ({
        '@type': 'Question',
        name: faq.header,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.seo_description,
        },
      }));

      jsonLd = {
        '@type': 'FAQPage',
        '@context': 'https://schema.org',
        mainEntity: faqItems,
      };
    }

    // 处理 Dynamic Yield campaigns
    if (itemAny.component === 'full-width-banner' && itemAny.banner_selector_name !== '') {
      const promise = dyCampaignsFetcher(
        {
          recommendationContext: { type: 'OTHER', data: [] },
          campaignNames: [itemAny.banner_selector_name],
        },
        cookieContext
      )
        .then(async (res) => {
          if (res && typeof res === 'object' && 'ok' in res) {
            const response = res as Response;
            if (response.ok) {
              try {
                const data = await response.json();
                if (data.choices && data.choices.length > 0) {
                  const choice = data.choices[0];
                  if (choice?.variations?.[0]?.payload?.data) {
                    dyCampaignsData[itemAny.banner_selector_name] = choice.variations[0].payload.data;
                  }
                }
              } catch (error) {
                logger.error('Error parsing DY campaign response', {
                  error,
                  campaignName: itemAny.banner_selector_name,
                });
              }
            } else {
              logger.error('Failed to fetch DY campaign', {
                status: response.status,
                statusText: response.statusText,
                campaignName: itemAny.banner_selector_name,
              });
            }
          } else {
            // DY Campaign response is empty or invalid - this is not an error, just log in development
            if (process.env.NODE_ENV === 'development') {
              console.log('DY Campaign response is empty or invalid');
            }
          }
        })
        .catch((error) => {
          // 容错处理：捕获网络超时等错误（如 JOYBOY-WEB-112）
          // 静默失败，不影响页面其他部分的加载
          logger.error('DY campaign fetch failed (timeout or network error)', {
            error: error?.message || String(error),
            campaignName: itemAny.banner_selector_name,
            errorType: error?.cause?.code || error?.name || 'unknown',
          });
          // 不抛出错误，让页面继续渲染
        });
      dyCampaignPromises.push(promise);
    }
  }

  return {
    dyCampaignPromises,
    hasFaqSchema,
    jsonLd,
  };
};

// 工具函数：处理包含 items 的组件
export const processComponentWithItems = (
  item: any,
  cookieContext: { cookies: any },
  dyCampaignsData: Record<string, any>
): ProcessItemsResult | null => {
  if (item.items && Array.isArray(item.items) && item.items.length > 0) {
    return processItems(item.items, cookieContext, dyCampaignsData);
  }
  return null;
};

// 工具函数：专门处理 Hero 组件
export const processHeroComponent = (
  content: any,
  cookieContext: { cookies: any },
  dyCampaignsData: Record<string, any>
): ProcessItemsResult => {
  const dyCampaignPromises: Promise<void>[] = [];
  let hasFaqSchema = false;
  let jsonLd: WithContext<FAQPage> = {
    '@type': 'FAQPage',
    '@context': 'https://schema.org',
  };

  // 查找 Hero 组件
  for (const item of content?.body || []) {
    const itemAny = item as any;
    if (itemAny.component === 'Hero' && itemAny.items && Array.isArray(itemAny.items) && itemAny.items.length > 0) {
      const heroResult = processItems(itemAny.items, cookieContext, dyCampaignsData);

      dyCampaignPromises.push(...heroResult.dyCampaignPromises);

      // 如果 Hero 组件中有 FAQ schema，使用它的
      if (heroResult.hasFaqSchema) {
        hasFaqSchema = heroResult.hasFaqSchema;
        jsonLd = heroResult.jsonLd;
      }
    }
  }

  return {
    dyCampaignPromises,
    hasFaqSchema,
    jsonLd,
  };
};

// 工具函数：处理整个页面内容
export const processPageContent = (
  content: any,
  cookieContext: { cookies: any },
  dyCampaignsData: Record<string, any>
): ProcessItemsResult => {
  const dyCampaignPromises: Promise<void>[] = [];
  let hasFaqSchema = false;
  let jsonLd: WithContext<FAQPage> = {
    '@type': 'FAQPage',
    '@context': 'https://schema.org',
  };

  // 处理 story.content.body
  const bodyResult = processItems(content?.body || [], cookieContext, dyCampaignsData);

  // 合并结果
  dyCampaignPromises.push(...bodyResult.dyCampaignPromises);
  hasFaqSchema = bodyResult.hasFaqSchema;
  jsonLd = bodyResult.jsonLd;

  // 处理包含 items 的组件（如 Hero 组件）
  for (const item of content?.body || []) {
    const itemAny = item as any;
    const componentResult = processComponentWithItems(itemAny, cookieContext, dyCampaignsData);

    if (componentResult) {
      // 合并组件的结果
      dyCampaignPromises.push(...componentResult.dyCampaignPromises);
      // 不包含图片预加载，只处理 Hero 组件中的图片

      // 如果组件中有 FAQ schema，使用它的
      if (componentResult.hasFaqSchema) {
        hasFaqSchema = componentResult.hasFaqSchema;
        jsonLd = componentResult.jsonLd;
      }
    }
  }

  return {
    dyCampaignPromises,
    hasFaqSchema,
    jsonLd,
  };
};
