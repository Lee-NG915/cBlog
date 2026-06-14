import React from 'react';
import { Typography } from '@castlery/fortress';

interface TitleProps {
  sx?: {};
  children: React.ReactNode;
}
export const H1Title: React.FC<TitleProps> = ({ sx, children }) => (
  <Typography level="h1" sx={{ paddingBottom: (theme) => theme.spacing(4), ...sx }}>
    {children}
  </Typography>
);

export const SubH2Title: React.FC<TitleProps> = ({ sx, children }) => (
  <Typography level="subh2" sx={{ paddingY: (theme) => theme.spacing(2), ...sx }}>
    {children}
  </Typography>
);
