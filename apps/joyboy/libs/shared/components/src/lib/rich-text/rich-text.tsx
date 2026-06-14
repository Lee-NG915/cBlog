import React from 'react';
import { Box, Typography } from '@castlery/fortress';

interface RichTextProps {
  content: string;
}
export const richTextClasses = {
  root: 'richtext-root',
};
export function RichText({ content }: RichTextProps) {
  return (
    <Typography>
      <Box
        className={richTextClasses.root}
        sx={{
          [`& a`]: {
            color: (theme) => theme.palette.brand.burntOrange[500],
            textDecorationColor: (theme) => theme.palette.brand.burntOrange[500],
            textDecoration: 'underline',
            [`&:hover,&:focus`]: {
              color: (theme) => theme.palette.brand.burntOrange[600],
              textDecorationColor: (theme) => theme.palette.brand.burntOrange[600],
            },
            [`&:active`]: {
              color: (theme) => theme.palette.brand.burntOrange[800],
              textDecorationColor: (theme) => theme.palette.brand.burntOrange[800],
            },
          },
          [`& img`]: {
            maxWidth: '100%',
          },
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      ></Box>
    </Typography>
  );
}

export default RichText;
