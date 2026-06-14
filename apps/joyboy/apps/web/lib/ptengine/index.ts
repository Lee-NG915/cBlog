'use client';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@castlery/observability/server';
/**
 * ptengine is still under trial evaluation,
 * put it here for now.
 * ptengine is a data analysis tool,
 * it is used to track user behavior on the website.
 */

export const PtengineTrackingEvents = {
  setPresetParams: 'setPresetParams', // ptengine预设参数
};
export function trackPentagonEvent({ event, data }: { event: string; data: Record<string, any> }) {
  if (typeof window === 'undefined') {
    return;
  }
  if (window.ptengine) {
    window.ptengine.track(event, data);
  } else {
    //优化
    const timerid = setTimeout(() => {
      if (window?.ptengine) {
        window.ptengine.track(event, data);
        timerid && clearTimeout(timerid);
      } else {
        const error = new Error('[trackPentagonEvent]>> ptengine is not defined');
        Sentry.captureException(error);
        logger.error('Ptengine tracking failed: ptengine not defined', { event, data });
      }
    }, 1500);
  }
}

export function setPtenginePresetParams({ pageVariant }: { pageVariant: string }) {
  trackPentagonEvent({
    event: PtengineTrackingEvents.setPresetParams,
    data: { pageVariant },
  });
}
