import { type FormProps } from '@castlery/fortress';
import {
  layoutStyle,
  firstname,
  lastname,
  company,
  apartment,
  street,
  state,
  city,
  buildingType,
  country,
  zipcode,
  phone,
  alternativePhone,
} from './helper.common';

export const formJsonAU = [
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
    ...buildingType,
    options: [
      { label: 'Apartment', value: 'Condo / Apartment' },
      { label: 'House', value: 'House' },
      { label: 'Commercial', value: 'Commercial' },
    ],
    ...layoutStyle.one,
  },
  {
    ...country,
    ...layoutStyle.one,
  },
  {
    ...state,
    label: 'State/territory',
    ...layoutStyle.two,
  },
  {
    ...city,
    label: 'Suburb',
    ...layoutStyle.two,
  },
  {
    ...zipcode,
    ...layoutStyle.two,
  },
  {
    ...company,
    ...layoutStyle.two,
  },
  {
    ...phone,
    ...layoutStyle.two,
  },
  {
    ...alternativePhone,
    ...layoutStyle.two,
  },
] as FormProps['form'];
export const validatorsAU = {
  firstname: {
    required: true,
  },
  lastname: {
    required: true,
  },
  address1: {
    required: true,
  },
  building_type: {
    required: true,
  },
  country: {
    required: true,
  },
  state_name: {
    required: true,
  },
  zipcode: {
    required: true,
    validator: 'zipCodeAU',
  },
  phone: {
    required: true,
    validator: 'phoneAU',
  },
  alternative_phone: {
    validator: 'phoneAU',
  },
  city: {
    required: true,
  },
};
