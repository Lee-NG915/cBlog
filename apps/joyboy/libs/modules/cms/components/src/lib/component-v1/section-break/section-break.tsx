'use client';

import React from 'react';
import { storyblokEditable } from '@storyblok/react/rsc';
import { DtStack } from '@castlery/modules-tracking-components';

export type SectionBreakProps = {
  blok: {
    _uid?: string;
    size?: 'extra-tall' | 'tall' | 'medium' | 'short';
  };
};

const SectionBreak = ({ blok }: SectionBreakProps) => {
  const { _uid, size = 'medium' } = blok || {};
  const heightConfig = {
    'extra-tall': 13,
    tall: 10,
    medium: 7,
    short: 4,
  };
  const heightSmallConfig = {
    'extra-tall': 12,
    tall: 8,
    medium: 5,
    short: 2,
  };

  return (
    <DtStack
      useImpression
      {...storyblokEditable(blok)}
      uid={_uid}
      key={_uid}
      componentName="section-break"
      sx={(theme) => ({
        height: theme.spacing(heightConfig[size]),
        [theme.breakpoints.down('sm')]: {
          height: theme.spacing(heightSmallConfig[size]),
        },
      })}
    />
  );
};

export { SectionBreak };
