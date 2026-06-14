import React from 'react';
import { Box, Container, Stack, linkClasses, selectClasses } from '@castlery/fortress';

export const GlobalX = {
  xs: 2,
  xsl: 2,
  xxl: 0,
};
export const GlobalNavUI: React.FunctionComponent = ({ children }) => (
  <Container
    maxWidth={false}
    disableGutters
    sx={(theme) => ({
      height: 40,
      backgroundColor: '#F6F3E7', // warmLinen-500
      display: {
        xs: 'none',
        md: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
      },
      [`& .${linkClasses.root}, .${selectClasses.root}, .${selectClasses.button}`]: {
        fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: 0,
        fontSize: '16px',
        // '@media (min-width: 0px) and (max-width: 600px)': {
        //   fontSize: '0.75rem',
        // },
        // '@media (min-width: 601px) and (max-width: 900px)': {
        //   fontSize: '0.75rem',
        // },
        // '@media (min-width: 901px)': {
        //   fontSize: '0.875rem',
        // },
        color: '#3C101E',

        ':hover': {
          color: '#844025',
          // textDecorationColor: '#844025',
          textDecoration: 'none',
        },
      },
      a: {
        fontSize: '16px',
        color: '#3C101E',
        '&:hover': {
          color: '#844025',
          // textDecorationColor: '#3C101E',
        },
      },

      // transform: 'translateX(-2px)',
    })}
  >
    <Container
      sx={(theme) => ({
        display: 'flex',
        justifyContent: 'space-between',
        [`& .${selectClasses.root}`]: {
          paddingInline: 0,
        },
        [`& .${selectClasses.indicator}`]: {
          marginInlineEnd: 0,
        },
      })}
    >
      <Box display="flex" alignItems="flex-end" />
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
        {children}
      </Stack>
    </Container>
  </Container>
);
