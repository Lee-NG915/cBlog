/* eslint-disable @typescript-eslint/no-unused-vars */
// import isEmpty from 'lodash-es/isEmpty';
import { TriggersMap, EventsNames } from '../triggers';
import * as Sentry from '@sentry/nextjs';

export type DY = { API: any };

export class DtManager {
  constructor() {}

  private getSafeDataLayer(): Array<any> | undefined {
    if (typeof window !== 'undefined') {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      return w.dataLayer;
    } else {
      console.error('[Error] => Tracking dataLayer event failed, window is undefined');
      Sentry.captureException(new Error('[Error] => Tracking dataLayer event failed, window is undefined'));
    }
    return undefined;
  }

  /**
   * @description Set or update user_id
   */
  trackUserId(id: string | number) {
    if (!id) {
      console.error('[Error] => User id is required');
      return false;
    }
    const dataLayer = this.getSafeDataLayer();
    if (dataLayer) {
      dataLayer.push({
        event: 'setUserId',
        userId: id,
      });
    }
    return true;
  }

  /**
   * @description Track the event
   * @param triggerName `EventsNames[eventName]`, e.g. `EventsNames.EVENT_TRANSACTION`
   * @returns
   */
  track(triggerName: (typeof EventsNames)[keyof typeof EventsNames]) {
    if (!triggerName) {
      console.error('[Error] => Event name is required');
      return false;
    }
    const trigger = TriggersMap[triggerName];
    if (!trigger) {
      console.error('[Error] => Event name is required');
      return false;
    }
    return (eventData: Record<string, any>) => {
      const dataLayer = this.getSafeDataLayer();
      if (dataLayer) {
        dataLayer.push(trigger(eventData as any));
      }
      return true;
    };
  }
  trackDy(triggerName: (typeof EventsNames)[keyof typeof EventsNames]) {
    const trigger = TriggersMap[triggerName];
    return (eventData: Record<string, any>) => {
      if (typeof window !== 'undefined') {
        const w = window as any;
        if (w.DY && typeof w.DY.API === 'function') {
          w.DY.API('event', trigger(eventData as any));
        } else {
          Sentry.captureException(new Error('[Error] => Tracking DY event failed, window.DY is not available'));
          console.error('window.DY is not available');
        }
      } else {
        Sentry.captureException(new Error('[Error] => Tracking DY event failed, window is undefined'));
        console.error('window is undefined');
      }
    };
  }
}

export default new DtManager();
