import {
  formItemLayout,
  AddressFormField,
  validatePhoneNumber,
  phoneNumberFormattingUtils,
  validatePostcode,
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
    formatter: phoneNumberFormattingUtils.SG,
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'alternativePhone',
    translationKey: 'alternativePhone',
    type: 'input',
    required: false,
    validation: { validate: validatePhoneNumber },
    formatter: phoneNumberFormattingUtils.SG,
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'zipcode',
    translationKey: 'zipcode',
    type: 'input',
    required: true,
    validation: { validate: validatePostcode },
    formatter: zipcodeFormattingUtils.SG,
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'streetNumber',
    translationKey: 'streetNumber',
    type: 'input',
    required: true,
    validation: {
      maxLength: 200,
    },
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'street',
    translationKey: 'street',
    type: 'input',
    label: 'Street Address',
    required: true,
    validation: {
      maxLength: 200,
    },
    layoutStyle: formItemLayout.oneColumn,
  },
  {
    key: 'buildingType',
    translationKey: 'buildingType',
    type: 'select',
    required: true,
    options: [
      {
        value: 'HDB',
        label: 'HDB',
      },
      {
        value: 'Condo / Apartment',
        label: 'Condo / Apartment',
      },
      {
        value: 'Landed',
        label: 'Landed',
      },
      {
        value: 'Commercial',
        label: 'Commercial',
      },
    ],
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'buildingName',
    translationKey: 'buildingName',
    type: 'input',
    required: false,
    validation: {
      maxLength: 200,
    },
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'floorUnitCheckbox',
    translationKey: 'floorUnitCheckbox',
    type: 'checkbox',
    required: false,
    layoutStyle: formItemLayout.oneColumn,
  },
  {
    key: 'level',
    translationKey: 'level',
    type: 'input',
    required: true,
    validation: {
      maxLength: 20,
    },
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'flat',
    translationKey: 'flat',
    type: 'input',
    required: true,
    validation: {
      maxLength: 20,
    },
    layoutStyle: formItemLayout.twoColumn,
  },
  {
    key: 'country',
    translationKey: 'country',
    type: 'input',
    required: true,
    disabled: true,
    value: 'Singapore',
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
    layoutStyle: formItemLayout.twoColumn,
    defaultValueReWrite: companyDefaultValueReWrite,
  },
];
