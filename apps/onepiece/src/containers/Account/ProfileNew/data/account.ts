import type { FormData, TFormValues } from '@castlery/fortress/HookForm/types';
import { phoneRegExp, phoneNumberFormatUtil } from 'config';

const emailCheckText = "I'd like to receive promotional emails from Castlery.";
const promotionCheckText =
  "I'd like to receive promotional messages from Castlery on SMS/Instant messaging apps (e.g. WhatsApp).";
export const form: (isMobile: boolean) => FormData = () => [
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
    subType: 'text',
    label: 'Email',
  },
  {
    key: 'phone',
    type: 'input',
    subType: 'tel',
    label: 'Mobile Number',
    // @todos: 无法使用imaskProps, 会报错
  },
  {
    key: 'subscriptionEmail',
    type: 'checkbox',
    subType: 'checkbox',
    placeholder: emailCheckText,
    joyProps: {
      sx: {
        fontSize: (theme: any) => theme.fontSize.sm,
      },
    },
    sliceWrapperJoyProps: {
      sx: {
        gridColumn: '1',
        marginTop: (theme: any) => theme.spacing(3),
      },
    },
  },
  {
    key: 'subscriptionSms',
    type: 'checkbox',
    subType: 'checkbox',
    placeholder: promotionCheckText,
    show: (values: TFormValues) => !!values.phone,
    joyProps: {
      sx: {
        fontSize: (theme: any) => theme.fontSize.sm,
      },
    },
    sliceWrapperJoyProps: {
      sx: {
        gridColumn: '1',
        mt: -2,
      },
    },
  },
];

export const validators = {
  firstname: { required: true, validator: 'fLName' },
  lastname: { required: true, validator: 'fLName' },
  email: { required: true, validator: 'email' },
  phone: {
    required: false,
    validator: {
      rule: phoneRegExp, // @todos: fortress更新之后，使用fortress内置校验器
      message: 'Please provide a valid phone number.',
    },
  },
};
