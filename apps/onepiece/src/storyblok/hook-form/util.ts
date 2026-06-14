import type { FormLayoutColumns } from './type';

export const formatLayout = (layout: FormLayoutColumns, mobile: boolean) => {
  const twoColumns = !mobile && layout === '2';
  return {
    display: 'grid',
    gridTemplateColumns: twoColumns ? 'repeat(2, 1fr)' : '1fr',
    alignItems: 'end',
    columnGap: 6,
    rowGap: 3,
  };
};

export const getTypes = (typeString: string) => {
  if (typeString && typeString.includes('_')) {
    const arr = typeString.split('_');
    return { type: arr[0], subType: arr[1] };
  }
  // throw Error('[STORYBLOK FORM ERROR]:: the type field format error');
};
