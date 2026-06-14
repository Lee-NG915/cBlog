/**
 * @import  在date-fns v4.0版本以上，已经集成了@date-fns/tz，可以使用TZDate, 请勿额外引入 date-fns-tz(非官方)
 * @see  `date-fns` https://date-fns.org/v4.1.0/docs/Getting-Started#installation
 * @see `@date-fns/tz` https://github.com/date-fns/tz?tab=readme-ov-file#tzdate
 * @see `date-fns-tz` https://github.com/marnusw/date-fns-tz?tab=readme-ov-file#date-and-time-zone-formatting
 */
import { EcEnv } from '@castlery/config';
import { tz } from '@date-fns/tz';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

import {
  isBefore,
  isAfter,
  getUnixTime,
  differenceInDays,
  isValid,
  setDefaultOptions,
  parse,
  addDays,
  addBusinessDays as addBusinessDaysDateFns,
} from 'date-fns';
import type { DateArg } from 'date-fns';
import { enUS, enCA, enAU, enGB } from 'date-fns/locale';

export type AvailableDate = string | Date | number; // iso string, Date, timestamp

const LOCALES = {
  SG: enUS,
  US: enUS,
  CA: enCA,
  AU: enAU,
  UK: enGB,
};
const targetLocale = LOCALES[EcEnv.NEXT_PUBLIC_COUNTRY as keyof typeof LOCALES];

const TIME_ZONE = EcEnv.NEXT_PUBLIC_TIME_ZONE;
/**
 * 设置默认选项
 * @see https://date-fns.org/v4.1.0/docs/setDefaultOptions
 */
setDefaultOptions({
  locale: targetLocale,
});

/**
 * Get a date/time representing local time in a given time zone from the UTC date
 * @description toGetZonedTime => Time zone sensitive, 时区敏感
 * @param date `Date` | `string` | `number`
 * @param timezone `string` optional, default is 'Asia/Singapore' IANA 标准时区字符串
 * @returns `Date`
 */
export const toGetZonedTime = (date: Date | string | number, timezone = TIME_ZONE): Date => {
  return toZonedTime(date, timezone as string);
};

export const getDate = (date?: string | number | Date, timezone = TIME_ZONE): Date => {
  if (date) {
    return toGetZonedTime(date, timezone);
  }
  // 如果date为空，则返回当前时区的时间
  return toGetZonedTime(new Date(), timezone);
};

/**
 * Given a date and any time zone, returns a Date with the equivalent UTC time
 * @description toFormZonedTime => Time zone sensitive, 时区敏感
 * @param date `Date` | `string` | `number`
 * @param timezone `string` optional, default is 'Asia/Singapore' IANA 标准时区字符串
 * @returns `Date`
 *
 */
export const toFormZonedTime = (date: Date | string | number, timezone = TIME_ZONE): Date => {
  return fromZonedTime(date, timezone as string);
};

/**
 * Check if a date is outdated.
 * @param start `string`
 * @param end `string`
 * @returns `boolean`
 */
export const isOutdated = (start?: string | number | Date, end?: string | number | Date) => {
  const now = getDate();
  if (!end && !start) {
    return false;
  }
  if (start && end) {
    const startDate = getDate(start);
    const endDate = getDate(end);
    return isBefore(now, startDate) || isAfter(now, endDate);
  }
  if (start) {
    const startDate = getDate(start);
    return isBefore(now, startDate);
  }
  if (end) {
    const endDate = getDate(end);
    return isAfter(now, endDate);
  }
  return false;
};

// 获取当前时间戳,ms
export function getTimestamp() {
  const nowDate = getDate();
  return nowDate.getTime();
}

// 获取指定日期时间戳,ms
export function getMilliSecondTimestamp(date: string) {
  const d = getDate(date);
  return d.getTime();
}

// 获取指定日期时间戳,s
export function getSecondTimestamp(date: string) {
  const d = getDate(date);
  return getUnixTime(d);
}

/**
 * Get the number of full day periods between two dates. Fractional days are truncated towards zero.
 * @description One "full day" is the distance between a local time in one day to the same local time on the next or previous day.
 * A full day can sometimes be less than or more than 24 hours if a daylight savings change happens between two dates.
 *  @description toFormZonedTime => Time zone sensitive, 时区敏感
 * @see https://date-fns.org/v4.1.0/docs/differenceInDays
 * @param laterDate `Date` | `string` | `number`
 * @param earlierDate `Date` | `string` | `number`
 * @param options `object` optional, default is {}
 * @returns `number`
 */
export function getRangeDays(laterDate: AvailableDate, earlierDate: AvailableDate, options = {}) {
  return differenceInDays(laterDate, earlierDate, {
    in: tz(TIME_ZONE as string),
    ...options,
  });
}

/**
 * Format a date to a string.
 * @see https://date-fns.org/v4.1.0/docs/format
 * @param date `string`
 * @param format `string` optional, default is 'MMM dd, yyyy',eg: Feb 02, 2025
 * @returns `string`
 */
export function formatDate(date: AvailableDate, formatter = 'MMM dd, yyyy', timezone = TIME_ZONE) {
  if (isValidDate(date)) {
    return formatInTimeZone(date, timezone as string, formatter);
  }
  return '';
}

/**
 * Check if a date is valid.
 * @see https://date-fns.org/v4.1.0/docs/isValid
 * @param date `string`
 * @returns `boolean`
 */
export function isValidDate(date: AvailableDate) {
  if (!date) return false;
  const d = date instanceof Date ? date : getDate(date as string);
  return isValid(d);
}

/**
 * Parse a date to a Date object.
 * @see https://date-fns.org/v4.1.0/docs/parse
 * @param date `string`
 * @param formatter `string` optional, default is 'MMM dd, yyyy',eg: Feb 02, 2025
 * @returns `Date`
 */
export function parseDate(date: string, formatter = 'MMM dd, yyyy') {
  return parse(date, formatter, new Date());
}

/**
 * Check if a date is a weekend.
 * @param date `Date`
 * @returns `boolean`
 */
export function isWeekend(date: AvailableDate) {
  const d = date instanceof Date ? date : getDate(date);
  return d.getDay() === 6 || d.getDay() === 0;
}

/**
 * Add some days to a date.
 * @param date `Date`
 * @param days `number`
 * @returns `Date`
 */
export function addSomeDays(date: AvailableDate, days: number) {
  return addDays(date, days);
}

export function isBeforeDate(date: Date | string | number, dateToCompare: Date | string | number) {
  return isBefore(date, dateToCompare);
}

export function isAfterDate(date: DateArg<Date>, dateToCompare: DateArg<Date>) {
  return isAfter(date, dateToCompare);
}

/**
 * Add the specified number of business days (mon - fri) to the given date, ignoring weekends.
 * @important Time zone insensitive， because it is based on timestamp
 * @param date `Date`
 * @param amount `number`
 * @returns `Date`
 * @docs https://date-fns.org/v4.1.0/docs/addBusinessDays
 */
export function addBusinessDays(date: Date | string | number, amount: number) {
  return addBusinessDaysDateFns(date, amount);
}

export const parseReviewsDate = (date: string) => {
  return formatDate(date, 'MMM d, yyyy');
};
