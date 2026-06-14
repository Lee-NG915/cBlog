import { daysToDate } from '@castlery/modules-cms-services';
import { logger } from '@castlery/observability/client';

/**
 * Convert a single deadline string to lead_time numeric filter
 *
 * @param deadline - Deadline string from Storyblok query_deliver_before
 * @returns Array with single numeric filter string in format "lead_time<=N", or empty array if invalid
 */
export function convertDeadlineToLeadTimeFilter(deadline: string | null | undefined): string[] {
  if (!deadline) {
    return [];
  }

  try {
    const endDays = daysToDate(deadline);

    // 过滤掉不合理的数据：end 必须大于 0
    if (endDays <= 0) {
      logger.warn('Filtering out invalid deliver before filter', {
        deadline,
        endDays,
        context: 'deliver_before_processing',
      });
      return [];
    }

    // 转换为 lead_time 的数值过滤器格式
    // 例如：如果 deadline 是 6 天后，则生成 "lead_time<=6"
    const filter = `lead_time<=${endDays}`;

    logger.debug('Converted deadline to lead_time filter', {
      deadline,
      endDays,
      filter,
      context: 'deliver_before_processing',
    });

    return [filter];
  } catch (error) {
    logger.error('Failed to convert deadline', {
      deadline,
      error: error instanceof Error ? error.message : String(error),
      context: 'deliver_before_processing',
    });
    return [];
  }
}
