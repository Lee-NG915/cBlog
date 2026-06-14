import { EcEnv, basePageConfig } from '@castlery/config';
import { validatePhoneNumber, phoneNumberFormattingUtils, validateEmail } from '@castlery/utils';

export type PosCreateCustomerFieldKey = 'firstname' | 'lastname' | 'email' | 'phone';

export interface AddressFormField {
  key: PosCreateCustomerFieldKey;
  translationKey: PosCreateCustomerFieldKey;
  type: 'input' | 'select' | 'checkbox';
  required: boolean;
  disabled?: boolean;
  validation?:
    | {
        minLength?: number;
        maxLength?: number;
      }
    | {
        validate: (value: string) => boolean | string;
      }
    | {
        pattern: RegExp;
      };
  formatter?: (value: string) => string;
  layoutStyle?: {
    gridColumn: {
      xs: string;
      lg: string;
    };
  };
}
const upperCountryKey = EcEnv.NEXT_PUBLIC_COUNTRY.toUpperCase();
const lowerCountryKey = upperCountryKey.toLowerCase();

export const form = [
  {
    key: 'firstname',
    translationKey: 'firstname',
    type: 'input',
    required: true,
    validation: {
      minLength: 1,
      maxLength: 32,
    },
  },

  {
    key: 'lastname',
    translationKey: 'lastname',
    type: 'input',
    required: true,
    validation: {
      minLength: 1,
      maxLength: 32,
    },
  },
  {
    key: 'email',
    translationKey: 'email',
    type: 'input',
    required: true,
    validation: {
      validate: validateEmail,
    },
  },
  {
    key: 'phone',
    translationKey: 'phone',
    type: 'input',
    required: false,
    validation: { validate: validatePhoneNumber },
    formatter: phoneNumberFormattingUtils[upperCountryKey as keyof typeof phoneNumberFormattingUtils],
  },
] as AddressFormField[];

export const termsLink = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${lowerCountryKey}${basePageConfig['terms-of-use']}`;
export const privacyLink = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${lowerCountryKey}${basePageConfig['privacy-policy']}`;
