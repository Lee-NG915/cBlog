import { basePageConfig, EcEnv } from "@castlery/config";

const prefix = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
export const SERVICE_LINK = {
  delivery: `/${prefix}${basePageConfig.delivery}`,
  warranty: `/${prefix}${basePageConfig.warranty}`,
  guarantee: `/${prefix}${basePageConfig.guarantee}`,
  salesAndRefunds: `/${prefix}${basePageConfig["sales-and-refunds"]}`,
};