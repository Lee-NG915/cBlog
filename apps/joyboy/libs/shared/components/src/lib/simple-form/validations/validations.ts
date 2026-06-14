import { EcEnv } from '@castlery/config';

export const isAuRegion = () => EcEnv.NEXT_PUBLIC_COUNTRY === 'AU';

export const isAuAbnApplicable = isAuRegion;

export const isAuPhoneValid = (phoneNumber: string) => {
  if (!isAuRegion()) {
    return true;
  }

  const digits = phoneNumber.replace(/\D/g, '');

  if (digits.length === 10) {
    return /^0[23478]\d{8}$/.test(digits);
  }

  if (digits.length === 11) {
    return /^61[23478]\d{8}$/.test(digits);
  }

  return false;
};

export const PHONE_VALIDATORS = {
  SG: /^(\+?65(\s|-)?)?\d{4}(\s|-)?\d{4}$/,
  AU: /^(?:\+?61|0)[ -]?[2-478](?:[ -]?\d){8}$/,
  US: /^(\+1\s?)?(\(?[23456789]{1}[0-9]{2}\)?)[\s-]?\d{3}[\s-]?\d{4}$/,
  CA: /^(\+1\s?)?(\(?[23456789]{1}[0-9]{2}\)?)[\s-]?\d{3}[\s-]?\d{4}$/,
  UK: /^(?:\+44[\s-]?|0)(?:\d[\s-]?){9,10}$/,
};

export const EMAIL_STRICT =
  /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+(?:[A-Za-z]{2,}|xn--[A-Za-z0-9-]{2,})$/;

export const ORDER_NUMBER_REGEX = /^\d{9}$/;

const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19] as const;

export const ABN_MAX_DIGITS = 11;

export const extractAbnDigits = (abnNumber: string) => abnNumber.replace(/\D/g, '');

export const sanitizeAbnInput = (abnNumber: string) => extractAbnDigits(abnNumber).slice(0, ABN_MAX_DIGITS);

export const isAbnValid = (abnNumber: string) => {
  if (!isAuAbnApplicable()) {
    return true;
  }

  const abn = extractAbnDigits(abnNumber);

  if (abn.length !== 11) {
    return false;
  }

  let sum = 0;
  for (let position = 0; position < ABN_WEIGHTS.length; position++) {
    const digit = Number(abn[position]) - (position === 0 ? 1 : 0);
    sum += ABN_WEIGHTS[position] * digit;
  }

  return sum % 89 === 0;
};

export const formatAbn = (abnNumber: string) => {
  if (!isAuAbnApplicable()) {
    return abnNumber;
  }

  const digits = extractAbnDigits(abnNumber);
  if (digits.length !== 11) {
    return abnNumber.trim();
  }
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
};
