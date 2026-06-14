import { type FormProps } from '@castlery/fortress';
import {
  layoutStyle,
  firstname,
  lastname,
  company,
  buildingName,
  street,
  streetNumber,
  level,
  flat,
  buildingType,
  country,
  zipcode,
  phone,
  alternativePhone,
} from './helper.common';

export const formJsonSG = [
  {
    ...firstname,
    ...layoutStyle.two,
  },
  {
    ...lastname,
    ...layoutStyle.two,
  },
  {
    ...company,
    ...layoutStyle.two,
  },
  {
    ...buildingName,
    ...layoutStyle.two,
  },
  {
    ...street,
    ...layoutStyle.one,
  },
  {
    ...streetNumber,
    ...layoutStyle.three,
  },
  {
    ...level,
    ...layoutStyle.three,
  },
  {
    ...flat,
    ...layoutStyle.three,
  },
  {
    ...buildingType,
    ...layoutStyle.two,
  },
  {
    ...country,
    ...layoutStyle.two,
  },
  {
    ...zipcode,
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
export const validatorsSG = {
  firstname: {
    required: true,
  },
  lastname: {
    required: true,
  },
  street: {
    required: true,
  },
  street_number: {
    required: true,
  },
  building_type: {
    required: true,
  },
  country: {
    required: true,
  },
  zipcode: {
    required: true,
    validator: 'zipCodeSG',
  },
  phone: {
    required: true,
    validator: 'phoneSG',
  },
  alternative_phone: {
    validator: 'phoneSG',
  },
};
