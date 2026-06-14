'use client';

import { IconButton } from '@castlery/fortress';
import { ArrowLeft, ArrowRight } from '@castlery/fortress/Icons';

export const BackButton = ({ onClick }) => {
  return (
    <IconButton onClick={onClick}>
      <ArrowLeft color="neutral" />
    </IconButton>
  );
};

export const ForthButton = ({ onClick }) => {
  return (
    <IconButton onClick={onClick}>
      <ArrowRight color="neutral" />
    </IconButton>
  );
};
