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

export const formJsonUS = [
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
  },
  {
    ...city,
    ...layoutStyle.two,
  },
  {
    ...zipcode,
    label: 'Zip Code',
    ...layoutStyle.two,
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

export const validatorsUS = {
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
    validator: 'zipCodeUS',
  },
  phone: {
    required: true,
    validator: 'phoneUS',
  },
  alternative_phone: {
    validator: 'phoneUS',
  },
};
