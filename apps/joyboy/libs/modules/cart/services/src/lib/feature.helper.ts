import { EcEnv } from "@castlery/config";
import type { CartBusinessFeatures } from "@castlery/modules-cart-domain";
import { SGMarketFeatures, CAMarketFeatures, AUMarketFeatures, USMarketFeatures, UKMarketFeatures } from "@castlery/modules-cart-domain";

export const getMarketFeatures = (): CartBusinessFeatures => {
    switch (EcEnv.NEXT_PUBLIC_COUNTRY) {
        case 'SG':
            return SGMarketFeatures;
        case 'CA':
            return CAMarketFeatures;
        case 'AU':
            return AUMarketFeatures;
        case 'US':
            return USMarketFeatures;
        case 'UK':
            return UKMarketFeatures;
        default:
            return SGMarketFeatures;

    }
}


export const cartFeatureService = {
    ...getMarketFeatures(),
}