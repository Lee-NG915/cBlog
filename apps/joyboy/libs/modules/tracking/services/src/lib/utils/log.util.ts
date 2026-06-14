import { logger } from '@castlery/observability/client';

const TRACKING_LOG_PREFIX = '[Tracking][LOG]';

type TRACKING_CHANNEL = 'GA' | 'DY' | 'Pinterest' | 'Facebook' | 'Klaviyo';

export const logTrackingWarn = (
  channel: TRACKING_CHANNEL,
  event: string,
  reason: string,
  extra?: Record<string, unknown>
): void => {
  logger.warn(`${TRACKING_LOG_PREFIX} ${channel} ${event}: ${reason}`, extra);
};

export const logTrackingError = (
  channel: TRACKING_CHANNEL,
  event: string,
  error: unknown,
  extra?: Record<string, unknown>
): void => {
  logger.error(`${TRACKING_LOG_PREFIX} ${channel} ${event}:`, {
    error,
    ...extra,
  });
};

export const logTrackingInfo = (channel: TRACKING_CHANNEL, event: string, extra?: Record<string, unknown>): void => {
  logger.info(`${TRACKING_LOG_PREFIX} ${channel} ${event}:`, extra);
};
