'use client';

import { ThHTMLAttributes } from 'react';

export function CustomWeekDay(props: ThHTMLAttributes<HTMLTableCellElement>) {
  const children = props.children;
  const label = typeof children === 'string' ? children.slice(0, 1) : children;
  return <td {...props}>{label}</td>;
}
