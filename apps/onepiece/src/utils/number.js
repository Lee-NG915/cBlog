/* eslint-disable no-param-reassign */
import lang from 'utils/lang';

export function format(num, decimal = 0) {
  try {
    return (+num)
      .toFixed(decimal)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .replace(/\.0+$/, '');
  } catch (error) {
    console.error(JSON.stringify({ message: 'Number formatting error', error }, null, 2));
    return '0';
  }
}

export function toPrice(num, zeroToFree) {
  // if +num is not a number, return the original value
  if (isNaN(+num)) {
    return num;
  }

  try {
    num = +num;
    if (num > 0) {
      return `${lang.t('common.currency_symbol')}${format(num, 2)}`;
    }
    if (num < 0) {
      return `-${lang.t('common.currency_symbol')}${format(-num, 2)}`;
    }
    if (zeroToFree) {
      return 'Free';
    }
    return `${lang.t('common.currency_symbol')}0`;
  } catch (error) {
    console.error(JSON.stringify({ message: 'Number formatting error', error }, null, 2));
    return '';
  }
}

// https://gist.github.com/gordonbrander/2230317
export function randomId(prefix) {
  return `${prefix || ''}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
}

export function validateCreditCard(value) {
  // accept only digits, dashes or spaces
  if (/[^0-9-\s]+/.test(value)) {
    return false;
  }

  // The Luhn Algorithm. It's so pretty.
  let nCheck = 0;
  let nDigit = 0;
  let bEven = false;
  value = value.replace(/\D/g, '');

  for (let n = value.length - 1; n >= 0; n--) {
    const cDigit = value.charAt(n);
    nDigit = parseInt(cDigit, 10);

    // eslint-disable-next-line no-cond-assign
    if (bEven && (nDigit *= 2) > 9) {
      nDigit -= 9;
    }

    nCheck += nDigit;
    bEven = !bEven;
  }

  return nCheck % 10 === 0;
}
