import type { ChannelType } from '../config/channel';

/**
 * @example
 * ChannelType =>`dt.channels.ga`、`dt.channels.kl` ...
 */
export type EventData = {
  eventId: string;
  actions: Record<
    ChannelType,
    {
      eventName: string;
      content: Record<string, any>;
    }
  >;
};

export interface CommonGAEvent {
  event: string;
  'eventDetails.category'?: string;
  'eventDetails.label'?: string;
  'eventDetails.action'?: string;
  'eventDetails.position'?: string;
}
