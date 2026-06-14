import { EcEnv } from '@castlery/config';

export const envAdapters = {
  isProductionEnv: EcEnv.NODE_ENV === 'production',
  currentRegion: EcEnv.NEXT_PUBLIC_COUNTRY.toUpperCase(),
  currentApplicationEnv: EcEnv.NODE_ENV.toLocaleUpperCase(),
  currentAppChannel: EcEnv.NEXT_PUBLIC_CHANNEL.toUpperCase(),
  mulberryToken: EcEnv.NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN,
  mulberrySdk: EcEnv.NEXT_PUBLIC_MULBERRY_SDK,
  guardsmanPublicKey: EcEnv.NEXT_PUBLIC_GUARDSMAN_PUBLIC_KEY,
  guardsmanWidgetSdk: EcEnv.NEXT_PUBLIC_GUARDSMAN_WIDGET_SDK,
  // todo: @abbywang23 to updated the below values after the web env is ready
  appleClientId: '',
  facebookClientId: '',
  googleClientId: '',
  gtmIds: EcEnv.NEXT_PUBLIC_GTM_ID,
  zipPublicKey: '',
  affirmPublicKey: '',
  affirmScript: '',
  paypalClientId: '',
  instalmentUrl: '',
  instalmentEncrypt: '',
};
