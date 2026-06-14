import React from 'react';
import { Sheet, Typography, Container } from '@castlery/fortress';
import PropTypes from 'prop-types';

export default function Acknowledgement({ text }) {
  return (
    <Container
      sx={{
        width: '100% !important',
      }}
    >
      <Sheet
        variant="soft"
        sx={(theme) => ({
          backgroundColor: theme.palette.brand.flour[50],
          py: {
            xs: 2,
            sm: 3,
          },
          textAlign: 'center',
          wordBreak: 'break-word',
          whiteSpace: 'pre-line',
        })}
      >
        <Typography level="caption1" textColor="brand.charcoal.800">
          {text}
        </Typography>
      </Sheet>
    </Container>
  );
}

Acknowledgement.propTypes = {
  text: PropTypes.string,
};
