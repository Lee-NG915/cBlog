import { EcEnv } from '@castlery/config';
import ReactDOM from 'react-dom';

export const StaticAssets = () => {
  if (EcEnv.NEXT_PUBLIC_ASSETS_PATH) {
    ReactDOM.prefetchDNS(`${EcEnv.NEXT_PUBLIC_ASSETS_PATH}`);
  }

  return null;
};
