'use client';
import {
  unstable_generateUtilityClass as generateUtilityClass,
  unstable_generateUtilityClasses as generateUtilityClasses,
} from '@mui/utils';

export function getPaginationItemUtilityClass(slot: string) {
  return generateUtilityClass('JoyPaginationItem', slot);
}

const paginationItemClasses = generateUtilityClasses('JoyPaginationItem', [
  'root',
  'page',
  'firstLast',
  'previousNext',
  'ellipsis',
  'disabled',
  'selected',
  'variantText',
  'variantOutlined',
  'colorPrimary',
  'colorNeutral',
  'colorDanger',
  'colorSuccess',
  'colorWarning',
  'sizeSm',
  'sizeMd',
  'sizeLg',
  'shapeCircular',
  'shapeRounded',
  'icon',
]);

export default paginationItemClasses;
