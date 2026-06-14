import { debounce } from 'instantsearch.js/es/lib/utils';

const debouncedProductTrackingHandler = debounce(
  async (
    hitData: { hitIndex: string; hitSku: string },
    trackingHandler: (hitData: { hitIndex: string; hitSku: string }, type: 'wishlist' | 'product') => Promise<void>
  ) => {
    await trackingHandler(hitData, 'product');
  },
  1000
);
const debouncedWishlistTrackingHandler = debounce(
  async (
    hitData: { hitIndex: string; hitSku: string },
    trackingHandler: (hitData: { hitIndex: string; hitSku: string }, type: 'wishlist' | 'product') => Promise<void>
  ) => {
    await trackingHandler(hitData, 'wishlist');
  },
  1000
);

/**
 * 设置产品点击事件监听器
 * @param trackingHandler 点击事件处理函数，接收产品数据作为参数
 */
export function initializeHitClickTracking(
  trackingHandler: (hitData: { hitIndex: string; hitSku: string }, type: 'wishlist' | 'product') => Promise<void>
) {
  // 使用事件委托来监听所有产品点击事件
  const handleClick = async (event: Event) => {
    const target = event.target as HTMLElement;
    const insightsSymbol = target.dataset.insightsSymbol;
    // 查找包含产品数据的最近父元素
    const productElement = target.closest('[data-hit-index]') as HTMLElement;
    if (!productElement) return;
    const hitIndex = productElement.dataset.hitIndex;
    const hitSku = productElement.dataset.hitSku;
    if (!hitIndex || !hitSku) return;

    if (insightsSymbol === 'wishlist_btn') {
      console.log('wishlist click');
      await debouncedWishlistTrackingHandler({ hitIndex, hitSku }, trackingHandler);
      return;
    }

    if (productElement) {
      console.log('product click');
      // 调用跟踪处理函数
      await debouncedProductTrackingHandler({ hitIndex, hitSku }, trackingHandler);
    }
  };

  // 添加点击事件监听器
  document.addEventListener('click', handleClick, true);

  // 返回清理函数
  return () => {
    document.removeEventListener('click', handleClick, true);
  };
}
