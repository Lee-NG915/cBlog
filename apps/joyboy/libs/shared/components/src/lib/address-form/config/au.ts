import {
  formItemLayout,
  AddressFormField,
  validatePhoneNumber,
  phoneNumberFormattingUtils,
  validatePostcode,
  getStateOptions,
  address1DefaultValueReWrite,
  companyDefaultValueReWrite,
} from './base';
import { zipcodeFormattingUtils } from '@castlery/utils';

export const addressFormFields: AddressFormField[] = [
  {
    key: 'firstname',
    translationKey: 'firstname',
    type: 'input',
    required: true,
    validation: {
      minLength: 1,
      maxLength: 32,
    },
    layoutStyle: formItemLayout.twoColumn,
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
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'phone',
    translationKey: 'phone',
    type: 'input',
    required: true,
    validation: { validate: validatePhoneNumber },
    formatter: phoneNumberFormattingUtils.AU,
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'alternativePhone',
    translationKey: 'alternativePhone',
    type: 'input',
    required: false,
    validation: { validate: validatePhoneNumber },
    formatter: phoneNumberFormattingUtils.AU,
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'street',
    translationKey: 'street',
    type: 'input',
    required: true,
    validation: {
      maxLength: 200,
    },
    layoutStyle: formItemLayout.oneColumn,
    defaultValueReWrite: address1DefaultValueReWrite,
  },
  {
    key: 'address2',
    translationKey: 'address2',
    type: 'input',
    required: false,
    validation: {
      maxLength: 200,
    },
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'buildingType',
    translationKey: 'buildingType',
    type: 'select',
    required: true,
    options: [
      {
        value: 'Condo / Apartment',
        label: 'Apartment',
      },
      {
        value: 'House',
        label: 'House',
      },
      {
        value: 'Commercial',
        label: 'Commercial',
      },
    ],
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'country',
    translationKey: 'country',
    type: 'input',
    required: true,
    disabled: true,
    value: 'Australia',
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'stateName',
    translationKey: 'stateName',
    type: 'select',
    required: true,
    options: getStateOptions('AU') || [],
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'city',
    translationKey: 'city',
    type: 'input',
    required: true,
    validation: {
      maxLength: 200,
    },
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'zipcode',
    translationKey: 'zipcode',
    type: 'input',
    required: true,
    validation: { validate: validatePostcode },
    formatter: zipcodeFormattingUtils.AU,
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'company',
    translationKey: 'company',
    type: 'input',
    required: false,
    validation: {
      maxLength: 200,
    },
    layoutStyle: formItemLayout.oneColumn,
    defaultValueReWrite: companyDefaultValueReWrite,
  },
];
