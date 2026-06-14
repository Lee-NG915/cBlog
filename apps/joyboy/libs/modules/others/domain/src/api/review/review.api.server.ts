import { unstable_cache as cache } from 'next/cache';
import { API_MAP } from '../api.map';

const getReviewListByPageOnServer = async (page: number, per_page: number) => {
  const cacheKey = `review-list-${page}-${per_page}`;
  return cache(
    async () => {
      const url = `${API_MAP.GET_REVIEW_LIST}?page=${page}&per_page=${per_page}`;

      // 重试逻辑：针对 503 等临时性错误进行重试
      let lastError: Error | null = null;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'GET',
          });

          if (response.ok) {
            return response.json();
          }

          // 503 Service Unavailable - 临时性错误，值得重试
          if (response.status === 503 && attempt < maxRetries) {
            // 等待一段时间后重试（指数退避）
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue;
          }

          // 其他错误或最后一次尝试失败，抛出错误
          throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
          lastError = error as Error;

          // 如果是最后一次尝试，抛出错误
          if (attempt === maxRetries) {
            throw lastError;
          }

          // 网络错误也值得重试
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }

      throw lastError || new Error('Fetch failed after retries');
    },
    [cacheKey],
    {
      tags: ['review-list', cacheKey],
      revalidate: 600,
    }
  )();
};

export { getReviewListByPageOnServer };
