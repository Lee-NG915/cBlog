import { Region, ApplicationChannel, ApplicationEnv, FeatureName } from '../config';

export interface Feature {
  /**
   * The name of the feature
   */
  featureName: FeatureName;
  /**
   * The description of the feature
   */
  description: string;
  /**
   * The status of the feature
   * @default `true`
   * @required
   */
  status: boolean;
  /**
   * The channels where the feature is enabled
   * @required
   * @default `[]`
   */
  enabledAppChannels: ApplicationChannel[];
  /**
   * The regions where the feature is enabled
   * @required
   */
  enabledRegions: Region[];
  /**
   * The environment where the feature is enabled
   */
  environment?: ApplicationEnv[];
  /**
   * The date when the feature was enabled
   * @default `UTC timestamp`
   */
  effectiveDate?: number;
  /**
   * The date when the feature will be disabled
   * @default `UTC timestamp`
   */
  expirationDate?: number;
  /**
   * The remark for the feature
   */
  remark?: string;
  /**
   * The payload for the feature
   */
  payload?: {
    [key: string]: any;
  };
}
