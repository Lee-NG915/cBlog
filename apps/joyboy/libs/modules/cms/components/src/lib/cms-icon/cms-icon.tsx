'use client';
import { IconsMap } from './map';
import { memo } from 'react';

export interface CmsIconProps {
  name: keyof typeof IconsMap;
  props?: {
    color?: string;
    width?: number | string;
    height?: number | string;
    fontSize?: number | string;
  };
}

export function CmsIconContent({ name, props = {} }: CmsIconProps) {
  const Icon = IconsMap[name] || null;

  if (!Icon) {
    return null;
  }
  return <Icon {...props} />;
}

export const CmsIcon = memo(CmsIconContent);

export default CmsIcon;
