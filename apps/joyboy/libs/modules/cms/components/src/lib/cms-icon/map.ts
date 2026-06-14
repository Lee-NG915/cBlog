import * as icons from '@castlery/fortress/Icons';

export const IconsMap = Object.keys(icons).reduce((acc, key) => {
  acc[key] = icons[key];
  return acc;
}, {} as Record<string, any>);
