import React, { useRef } from 'react';
import { storyblokEditable } from '@storyblok/react';
import { Stack } from '@castlery/fortress';
import Recommendation from 'containers/Campaigns/S2Campaign/components/Recommendation.js';
import { useAnchorScroll } from '../hooks/anchor';

export type DYEmbedProps = {
  blok: {
    _uid?: string;
    selector_name?: string;
    anchor_link?: string;
  };
};

const DYEmbed = ({ blok }: DYEmbedProps) => {
  const { _uid, selector_name, anchor_link } = blok;

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  return (
    <Stack {...storyblokEditable(blok)} key={_uid} ref={blokRef} id={anchor_link?.slice(1)}>
      <Recommendation recommendationName={selector_name} />
    </Stack>
  );
};

export { DYEmbed };
