import { messageMap } from '.';
import { InstanceValidator } from '../types';
import { passwordChecker } from '../helpers/passwordChecker';
// import { phoneChecker } from 'fortress/HookForm/helpers/phoneChecker';
import { postcodeValidator, postcodeValidatorExistsForCountry } from 'postcode-validator';

type InnerValidatorKey = string;
type MapValue = {
  rule: RegExp | InstanceValidator;
  message: string;
};
const defaultMsg = messageMap.get('default') || '';

const rulesMap: Map<InnerValidatorKey, MapValue> = new Map([
  [
    'email',
    {
      rule: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: messageMap.get('email') || defaultMsg,
    },
  ],
  [
    'phoneUS',
    {
      // rule: /^(\+1\s?)?((\([23456789]{3}\))|[0-9]{3})[\s-]?[\0-9]{3}[\s-]?[0-9]{4}$/,
      // rule: /^(\+1\s?)?(\([23456789]{1}[0-9]{2}\))[\s-]?\d{3}[\s-]?\d{4}$/,
      rule: /^(\+1\s?)?(\(?[23456789][0-9]{2}\)?)[\s-]?\d{3}[\s-]?\d{4}$/,
      message: messageMap.get('phone') || defaultMsg,
    },
  ],
  [
    'phoneSG',
    {
      rule: /^(\+?65(\s|-)?)?\d{4}(\s|-)?\d{4}$/,
      message: messageMap.get('phone') || defaultMsg,
    },
  ],
  [
    'phoneAU',
    {
      rule: /^(?:\+?61|0)[ -]?[2-478](?:[ -]?\d){8}$/,
      message: messageMap.get('phone') || defaultMsg,
    },
  ],
  [
    'phoneCA',
    {
      // rule: /^(\+1\s?)?(\([23456789]{1}[0-9]{2}\))[\s-]?\d{3}[\s-]?\d{4}$/,
      rule: /^(\+1\s?)?(\(?[23456789][0-9]{2}\)?)[\s-]?\d{3}[\s-]?\d{4}$/,
      message: messageMap.get('phone') || defaultMsg,
    },
  ],
  [
    'phoneUK',
    {
      rule: /^(?:\+44[\s-]?|0)(?:\d[\s-]?){9,10}$/,
      message: messageMap.get('phone') || defaultMsg,
    },
  ],
  [
    'userName',
    {
      rule: /^[\w\s]{4,32}$/, //[A-Za-z0-9_ ]
      message: messageMap.get('userName') || defaultMsg,
    },
  ],
  [
    'fLName', //firstName or lastName
    {
      rule: /^[\w\s]{2,20}$/, //[A-Za-z0-9_ ]
      message: messageMap.get('fLName') || defaultMsg,
    },
  ],
  [
    'password',
    {
      rule: passwordChecker as InstanceValidator,
      message: messageMap.get('password') || defaultMsg,
    },
  ],
  [
    'Date',
    {
      rule: (value: any) => value instanceof Date,
      message: messageMap.get('date') || defaultMsg,
    },
  ],
  ['zipCodeSG', { rule: /^\d{6}$/, message: messageMap.get('zipCode') || defaultMsg }],
  ['zipCodeAU', { rule: /^\d{4}$/, message: messageMap.get('zipCode') || defaultMsg }],
  ['zipCodeUS', { rule: /^\d{5}(-?\d{4})?$/, message: messageMap.get('zipCode') || defaultMsg }],
  [
    'zipCodeUK',
    {
      rule: (value: string) => {
        if (!value) return true;
        if (postcodeValidatorExistsForCountry('UK')) {
          return postcodeValidator(value, 'UK') ? true : messageMap.get('zipCode');
        }
        console.error(`InValid Copuntry Code: postcode-validator does not support UK`);
        return true;
      },
      message: messageMap.get('zipCode') || defaultMsg,
    },
  ],
  [
    'zipCodeCA',
    {
      rule: /^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z]\s[0-9][ABCEGHJ-NPRSTV-Z][0-9]$/i,
      message: messageMap.get('zipCode') || defaultMsg,
    },
  ],
]);

export default rulesMap;
