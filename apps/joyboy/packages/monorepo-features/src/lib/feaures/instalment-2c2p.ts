import type { Feature } from '../types';
import { Region, FeatureName, ApplicationChannel } from '../config';
import { Adapters } from '../adapters';

const installment2c2p: Feature = {
  featureName: FeatureName.INSTALMENT_2C2P,
  description: 'Installment configuration',
  enabledRegions: [Region.SG],
  enabledAppChannels: [ApplicationChannel.WEB],
  status: true,
  payload: {
    banks: [
      {
        key: 'DBS',
        icons: [
          'https://res.cloudinary.com/castlery/image/upload/v1749808034/2c2p/dbs.png',
          'https://res.cloudinary.com/castlery/image/upload/v1749807950/2c2p/posb.png',
        ],
      },
      {
        key: 'OCBC',
        icons: ['https://res.cloudinary.com/castlery/image/upload/v1749808130/2c2p/ocbc.png'],
      },
      {
        key: 'UOB',
        icons: ['https://res.cloudinary.com/castlery/image/upload/v1749808157/2c2p/uob.png'],
      },
      {
        key: 'AMEX',
        icons: ['https://res.cloudinary.com/castlery/image/upload/v1749808184/2c2p/amex.png'],
      },
    ],
    url: Adapters.instalmentUrl,
    encrypt: Adapters.instalmentEncrypt,
  },
};

export default installment2c2p;
