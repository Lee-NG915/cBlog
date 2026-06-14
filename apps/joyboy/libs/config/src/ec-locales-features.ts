import {
  accessInSgAndAu,
  accessInSgAndAuAndCA,
  accessInUS,
  accessInAU,
  accessInSG,
  accessExcludeSG,
  accessInCA,
  accessInUK,
} from './ec-constant';
import { EcEnv } from './ec-env';

export const enableO2O = accessInSG || accessInAU || accessInUS;
export const enableO2OFOrderV2 = accessInSgAndAuAndCA;
export const enableCAPI = accessInSgAndAuAndCA || accessInUS;
export const enableZipCode = accessExcludeSG;
export const enableWarranty = accessInUS || accessInCA;
export const enableMulberry = (accessInUS || accessInCA) && EcEnv.NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN;
export const enableBranch = accessInSG || accessInAU || accessInUS;
export const enablePinterest = accessInAU;
export const enableRetail = accessInSgAndAu;
export const enableShowroom = accessInAU;
export const enableSgStudios = accessInSG;
export const enableAuStudios = accessInAU;
export const enableBlackOut = accessInAU;
export const enableYotpo = EcEnv.NEXT_PUBLIC_YOTPO_ENABLED;
export const enableQuotation = accessInUS || accessInAU || accessInSG;
export const enableQuotationSevenDays = accessInUS || accessInAU;
export const enabledSearchZipcodeForShippingByGoogle = accessInAU;
export const showApartmentBeforeStreet = accessInUK;
export const enableGuarantee = accessInUK;
export const enableDisplayProductShipping = accessInAU || accessInUS || accessInCA || accessInUK;
export const enableWarehouseFrom = accessInSG || accessInAU || accessInUS || accessInCA;
export const enablePostcode = accessInAU || accessInUK;
export const enablePrivacyPolicy = accessInSG || accessInAU || accessInCA || accessInUK;
export const enableSpecificPrivacyPolicy = accessInCA || accessInUK;
export const enableAlert = accessInUS || accessInCA || accessInUK;
export const enableTermsOfUse = accessInUS;
