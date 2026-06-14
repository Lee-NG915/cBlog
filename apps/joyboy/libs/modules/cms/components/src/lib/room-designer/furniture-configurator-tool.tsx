'use client';

import React from 'react';
import { HullaIntegrate } from './HullaIntegrate';
import { EcEnv } from '@castlery/config';

const folder = {
  SG: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test')
    ? 'modular-configurator-sg-test_2025brand'
    : 'modular-configurator-sg-prod_2025brand',
  AU: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test')
    ? 'modular-configurator-au-test_2025brand'
    : 'modular-configurator-au-prod_2025brand',
  US: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test')
    ? 'modular-configurator-test_2025brand'
    : 'modular-configurator-prod_2025brand',
  CA: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test')
    ? 'modular-configurator-ca-test_2025brand'
    : 'modular-configurator-ca-prod_2025brand',
  UK: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test')
    ? 'modular-configurator-uk-test_2025brand'
    : 'modular-configurator-uk-prod_2025brand',
};

const FurnitureConfiguratorTool = () => {
  return <HullaIntegrate folder={folder[EcEnv.NEXT_PUBLIC_COUNTRY]} id="hulla-configurator" />;
};

export { FurnitureConfiguratorTool };
