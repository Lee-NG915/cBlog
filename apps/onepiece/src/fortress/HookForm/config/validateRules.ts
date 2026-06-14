import { messageMap } from '.';
import { InstanceValidator } from '../types';
import { passwordChecker } from '../helpers/passwordChecker';
// import { phoneChecker } from 'fortress/HookForm/helpers/phoneChecker';

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
      rule: /^(\+1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s-]?[\0-9]{3}[\s-]?[0-9]{4}$/,
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
    'userName',
    {
      rule: /^[\w]{4,20}$/gi, //[A-Za-z0-9_]
      message: messageMap.get('userName') || defaultMsg,
    },
  ],
  [
    'fLame',
    {
      rule: (value) => value?.length <= 32,
      message: messageMap.get('fLame') || defaultMsg,
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
]);

export default rulesMap;
