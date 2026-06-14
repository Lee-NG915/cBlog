// import the original type declarations
import 'i18next';
import { defaultNS } from '../settings';
import type { Resource } from './resource';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: typeof defaultNS;
    // custom resources type
    resources: Resource;
    // other
  }
}
