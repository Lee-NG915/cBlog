/**
 * Terminal channels for data collection
 */
export enum Channels {
  GA = 'Google Analytics',
  KLA = 'Klaviyo',
  FB = 'Facebook',
  DY = 'Dynamic Yield',
  YOT = 'Yotpo',
  GA_ADS = 'Google Ads',
  FB_ADS = 'Facebook Ads',
}

export type ChannelsTypes = typeof Channels;
export type ChannelType = keyof ChannelsTypes;
export type Channel = ChannelsTypes[keyof ChannelsTypes];
