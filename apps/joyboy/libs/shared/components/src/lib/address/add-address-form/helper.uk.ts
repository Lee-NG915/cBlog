import { type FormProps } from '@castlery/fortress';
import {
  layoutStyle,
  firstname,
  lastname,
  company,
  apartment,
  street,
  city,
  country,
  zipcode,
  phone,
  alternativePhone,
} from './helper.common';

export const formJsonUK = [
  {
    ...firstname,
    ...layoutStyle.two,
  },
  {
    ...lastname,
    ...layoutStyle.two,
  },
  {
    ...phone,
    ...layoutStyle.two,
    imaskProps: {
      mask: [
        {
          mask: '+{44}0000000000',
          startsWith: '+44',
        },
        {
          mask: '{0}0000000000',
          startsWith: '0',
        },
      ],
      dispatch: (appended: string, dynamicMasked: any) => {
        // 防止递归调用
        if (dynamicMasked._preventRecursion) {
          return dynamicMasked.compiledMasks[0];
        }

        const number = (dynamicMasked.value + appended).replace(/\D/g, '');

        // 如果以44开头，补充为+44格式
        if (number.startsWith('44')) {
          dynamicMasked._preventRecursion = true;
          dynamicMasked.value = '+44' + number.slice(2);
          dynamicMasked._preventRecursion = false;
          return dynamicMasked.compiledMasks[0];
        }

        // 如果以0开头，使用本地格式
        if (number.startsWith('0')) {
          return dynamicMasked.compiledMasks[1];
        }

        // 其他情况，自动补充为+44格式
        dynamicMasked._preventRecursion = true;
        dynamicMasked.value = '+44' + number;
        dynamicMasked._preventRecursion = false;
        return dynamicMasked.compiledMasks[0];
      },
    },
  },
  {
    ...alternativePhone,
    ...layoutStyle.two,
    imaskProps: {
      mask: [
        {
          mask: '+{44}0000000000',
          startsWith: '+44',
        },
        {
          mask: '{0}0000000000',
          startsWith: '0',
        },
      ],
      dispatch: (appended: string, dynamicMasked: any) => {
        // 防止递归调用
        if (dynamicMasked._preventRecursion) {
          return dynamicMasked.compiledMasks[0];
        }

        const number = (dynamicMasked.value + appended).replace(/\D/g, '');

        // 如果以44开头，补充为+44格式
        if (number.startsWith('44')) {
          dynamicMasked._preventRecursion = true;
          dynamicMasked.value = '+44' + number.slice(2);
          dynamicMasked._preventRecursion = false;
          return dynamicMasked.compiledMasks[0];
        }

        // 如果以0开头，使用本地格式
        if (number.startsWith('0')) {
          return dynamicMasked.compiledMasks[1];
        }

        // 其他情况，自动补充为+44格式
        dynamicMasked._preventRecursion = true;
        dynamicMasked.value = '+44' + number;
        dynamicMasked._preventRecursion = false;
        return dynamicMasked.compiledMasks[0];
      },
    },
  },
  {
    ...apartment,
    ...layoutStyle.one,
  },
  {
    ...street,
    key: 'address1',
    label: 'Street Address',
    ...layoutStyle.one,
  },
  {
    ...country,
    ...layoutStyle.one,
  },
  {
    ...city,
    label: 'City/Town',
    ...layoutStyle.two,
  },
  {
    ...zipcode,
    label: 'Postcode',
    ...layoutStyle.two,
    joyProps: {
      sx: {
        input: {
          textTransform: 'uppercase', // 仅是显示大写，并不改变实际值
        },
      },
    },
    imaskProps: {
      mask: [
        {
          mask: '****{ }***',
        },
        {
          mask: '***{ }***',
        },
      ],
      definitions: {
        '*': /[A-Za-z0-9]/,
      },
    },
  },
  {
    ...company,
    ...layoutStyle.two,
  },
] as FormProps['form'];
export const validatorsUK = {
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
  zipcode: {
    required: true,
    validator: 'zipCodeUK',
  },
  phone: {
    required: true,
    validator: 'phoneUK',
  },
  alternative_phone: {
    validator: 'phoneUK',
  },
  city: {
    required: true,
  },
};
