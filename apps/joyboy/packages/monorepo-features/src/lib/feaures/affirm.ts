import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

const affirm: Feature = {
  featureName: FeatureName.AFFIRM,
  description:
    'Affirm Payment is a Buy Now Pay Later (BNPL) service mainly used for e-commerce and online payments. It allows consumers to choose installment payments or deferred payments at checkout without using a traditional credit card. Affirm provides a more flexible payment method through its zero or low interest installment model.',
  remark: 'This payment method is only available in the US market',
  status: true,
  enabledRegions: [Region.US, Region.SG],
  enabledAppChannels: [ApplicationChannel.WEB],
  payload: {
    publicKey: Adapters.affirmPublicKey,
    script: Adapters.affirmScript,
  },
};

export default affirm;
