'use client';

import React, { useRef, useMemo } from 'react';
import { Stack } from '@castlery/fortress';
import { useAnchorScroll } from '../../hooks';

interface AnchorProps {
  blok: {
    anchor_link: string;
    _uid: string;
  };
}
export const Anchor = ({ blok }: AnchorProps) => {
  const { anchor_link, _uid } = blok;
  const anchor = useMemo(() => {
    if (anchor_link && anchor_link.indexOf('#') > -1) {
      return anchor_link.split('#')[1];
    }
    return '';
  }, [anchor_link]);
  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor,
  });
  return <Stack ref={blokRef} componentName="anchor" uid={_uid} key={_uid} id={anchor} />;
};
