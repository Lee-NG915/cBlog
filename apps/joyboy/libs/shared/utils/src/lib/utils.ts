import type { ReadonlyURLSearchParams } from 'next/navigation';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability';
// import currency from 'currency.js';

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const format = (num: number, decimal = 0) => {
  try {
    return (+num)
      .toFixed(decimal)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .replace(/\.0+$/, '');
  } catch (error) {
    // console.error(error);
    return '0';
  }
};
// export const toPrice = (num: number, zeroToFree = false) => {
//   try {
//     num = +num;
//     if (Number.isNaN(num)) return '';
//     if (num == 0) {
//       if (zeroToFree) {
//         return 'Free';
//       } else {
//         return `${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}0`;
//       }
//     }
//     return currency(num, {
//       symbol: EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL,
//       separator: ',',
//       decimal: '.',
//       // precision: 0,
//     }).format();
//   } catch (error) {
//     return '';
//   }
// };
export function toPrice(num: number, zeroToFree?: boolean) {
  // if +num is not a number, return the original value
  if (isNaN(+num)) {
    return String(num);
  }

  try {
    num = +num;
    if (num > 0) {
      return `${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}${format(num, 2)}`;
    }
    if (num < 0) {
      return `-${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}${format(-num, 2)}`;
    }
    if (zeroToFree) {
      return 'Free';
    }
    return `${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}0`;
  } catch (error) {
    logger.error('Number formatting error', { error });
    return '';
  }
}

export function randomId(prefix: string) {
  return `${prefix || ''}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
}

export function exportAllClassProperties(obj: any) {
  const result: any = {};

  // 拷贝实例自身属性
  Object.getOwnPropertyNames(obj).forEach((key) => {
    result[key] = obj[key];
  });

  // 拷贝原型上的属性（排除 constructor）
  Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach((key) => {
    if (key !== 'constructor') {
      const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), key);
      if (desc && typeof desc.value === 'function') {
        // 方法
        result[key] = obj[key].bind(obj);
      } else {
        // getter
        result[key] = obj[key];
      }
    }
  });

  return result;
}
/**
 * 将文本中每个单词的首字母转换为大写，其他字母转换为小写
 * @param text 要转换的文本
 * @returns 转换后的文本，如果输入为空则返回空字符串
 * @example
 * capitalize('hello world') // 'Hello World'
 * capitalize('HELLO WORLD') // 'Hello World'
 * capitalize('hELLo wORLd') // 'Hello World'
 */
export function capitalize(text: string): string {
  if (!text) return '';
  try {
    return text.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch (error) {
    logger.error('Error in capitalize', { error, text });
    return text;
  }
}

/**
 * 三元表达式工具函数，支持函数延迟执行
 * @param judge 判断条件
 * @param firstVal 条件为真时的值或函数
 * @param secondValue 条件为假时的值或函数
 * @returns 根据条件返回对应的值
 * @example
 * ternaryExpressions(true, 'A', 'B') // 'A'
 * ternaryExpressions(false, 'A', 'B') // 'B'
 * ternaryExpressions(true, () => 'A', () => 'B') // 'A'
 * ternaryExpressions(false, () => 'A', () => 'B') // 'B'
 */
export function ternaryExpressions<T>(judge: boolean, firstVal: T | (() => T), secondValue: T | (() => T)): T {
  if (judge) {
    if (typeof firstVal === 'function') {
      return (firstVal as () => T)();
    }
    return firstVal;
  }
  if (typeof secondValue === 'function') {
    return (secondValue as () => T)();
  }
  return secondValue;
}
