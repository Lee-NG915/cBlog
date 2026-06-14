'use client';
import {
  unstable_generateUtilityClass as generateUtilityClass,
  unstable_generateUtilityClasses as generateUtilityClasses,
} from '@mui/utils';

export function getPaginationUtilityClass(slot: string) {
  return generateUtilityClass('JoyPagination', slot);
}

const paginationClasses = generateUtilityClasses('JoyPagination', [
  'root',
  'ul',
  'soft',
  'outlined',
  'text',
  'solid',
  'colorPrimary',
  'colorNeutral',
  'colorSuccess',
  'colorWarning',
  'colorDanger',
  'sizeSm',
  'sizeMd',
  'sizeLg',
]);

export default paginationClasses;
