import React from 'react';
import { SortingSelector } from 'searchkit';
import { SORT_OPTIONS } from '../config';
import { Select } from '../searchkitComponents';
import style from './style.scss';

export default function SortingSelectorWrapper() {
  return <SortingSelector mod={`${style.sorting}__select`} options={SORT_OPTIONS} listComponent={Select} />;
}
