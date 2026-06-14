import dayjs from 'dayjs';

export const isDate = (date: any) => date instanceof Date;

export const isBefore = (
  { before, after = dayjs().toDate() }: { before: Date; after?: Date },
  type?: 'year' | 'month'
) => {
  if (!type) {
    return dayjs(before).isBefore(dayjs(after));
  }
  if (type === 'year') {
    return dayjs(before).year() <= dayjs(after).year();
  }
  if (type === 'month') {
    return dayjs(before).month() <= dayjs(after).month();
  }
};
export const getYear = (date: Date) => dayjs(date).year();
export const getCurrentYear = () => dayjs().year();

export const calcYears = (start: number, count: number) => {
  return new Array(count).fill(start).map((_, i) => _ * 1 + i);
};

export const monthFormat = (value: Date) => dayjs(value).format('MMM');
