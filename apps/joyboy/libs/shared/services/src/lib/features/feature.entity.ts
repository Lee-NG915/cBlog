export interface FeatureEntity {
  enabledOrderV2: boolean;
  enabledPosUmsAuth: boolean;
  enableHardCodedFreeShippingLimit: boolean /** Whether to use hard-coded free shipping threshold */;
  hardCodedFreeShippingLimit: number /** The hard-coded free shipping threshold */;
}
