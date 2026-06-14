import type { FormProps } from '@castlery/fortress';
import { EcEnv, accessInAU, accessInSG, accessInUS } from '@castlery/config';
export const form = [
  {
    key: 'firstname',
    type: 'input',
    subType: 'text',
    label: 'First Name',
  },
  {
    key: 'lastname',
    type: 'input',
    subType: 'text',
    label: 'Last Name',
  },
  {
    key: 'email',
    type: 'input',
    subType: 'email',
    label: 'Email',
  },
  {
    key: 'phone',
    type: 'input',
    subType: 'text',
    label: 'Phone Number',
  },
] as FormProps['form'];

export const validators = {
  firstname: {
    required: true,
    validator: 'fLName',
  },
  lastname: {
    required: true,
    validator: 'fLName',
  },
  email: {
    required: true,
    validator: 'email',
  },
  phone: {
    validator: accessInSG ? 'phoneSG' : accessInAU ? 'phoneAU' : accessInUS ? 'phoneUS' : '',
  },
};

export const isProd = EcEnv.NODE_ENV.toLowerCase() === 'production';
export const __COUNTRY__ = EcEnv.NEXT_PUBLIC_COUNTRY;
export const termsLink = `https://www${isProd ? '' : '-test'}.castlery.com/${__COUNTRY__.toLowerCase()}/terms-of-use`;
export const privacyLink = `https://www${
  isProd ? '' : '-test'
}.castlery.com/${__COUNTRY__.toLowerCase()}/privacy-policy`;
