import { type FormProps } from '@castlery/fortress';
import {
  layoutStyle,
  firstname,
  lastname,
  company,
  street,
  country,
  zipcode,
  phone,
  alternativePhone,
  apartment,
  state,
  city,
} from './helper.common';

export const formJsonCA = [
  {
    ...firstname,
    ...layoutStyle.two,
  },
  {
    ...lastname,
    ...layoutStyle.two,
  },
  {
    ...street,
    key: 'address1',
    label: 'Street Address',
    ...layoutStyle.one,
  },
  {
    ...apartment,
    ...layoutStyle.one,
  },
  {
    ...country,
    ...layoutStyle.one,
  },
  {
    ...state,
    ...layoutStyle.two,
    label: 'Province / Territory',
  },
  {
    ...city,
    ...layoutStyle.two,
    label: 'City / Town',
  },
  {
    ...zipcode,
    label: 'Zip Code',
    ...layoutStyle.two,
    imaskProps: {
      mask: 'a0a{ }0a0', //M5H 2N1
    },
    joyProps: {
      sx: {
        input: {
          textTransform: 'uppercase', // 仅是显示大写，并不改变实际值
        },
      },
    },
  },
  {
    ...company,
    ...layoutStyle.two,
  },
  {
    ...phone,
    imaskProps: {
      mask: '+{1}(000)000-0000',
    },
    ...layoutStyle.two,
  },
  {
    ...alternativePhone,
    imaskProps: {
      mask: '+{1}(000)000-0000',
    },
    ...layoutStyle.two,
  },
] as FormProps['form'];

export const validatorsCA = {
  firstname: {
    required: true,
  },
  lastname: {
    required: true,
  },
  address1: {
    required: true,
  },
  country: {
    required: true,
  },
  state_name: {
    required: true,
  },
  city: {
    required: true,
  },
  zipcode: {
    required: true,
    validator: 'zipCodeCA',
  },
  phone: {
    required: true,
    validator: 'phoneCA',
  },
  alternative_phone: {
    validator: 'phoneCA',
  },
};
