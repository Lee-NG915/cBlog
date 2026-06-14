import { EcEnv } from './ec-env';

const enabledChangeDeliveryDate = !['US', 'CA'].includes(EcEnv.NEXT_PUBLIC_COUNTRY);
const enabledAdditionalServices = EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' && EcEnv.NEXT_PUBLIC_COUNTRY !== 'SG';

export const ecPosFeatures = {
  enabledChangeDeliveryDate,
  enabledAdditionalServices,
};
