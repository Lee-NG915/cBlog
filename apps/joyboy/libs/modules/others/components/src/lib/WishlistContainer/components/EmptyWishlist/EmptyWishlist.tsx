'use client';

import { EcEnv } from '@castlery/config';
import { Button, Stack, Typography } from '@castlery/fortress';
import { NextFortressLink } from '@castlery/shared-components';

const EmptyWishlist = () => {
  return (
    <Stack
      sx={(theme) => ({
        alignItems: 'center',
        gap: theme.spacing(6),
        mb: {
          xs: theme.spacing(30),
          sm: theme.spacing(40),
        },
      })}
    >
      <Typography
        level="body1"
        textAlign="center"
        sx={(theme) => ({
          padding: {
            xs: `0 ${theme.spacing(2)}`,
            sm: 0,
          },
        })}
      >
        Save what you like by tapping the nearby heart. We’ll keep ‘em safely here for you.
      </Typography>
      <NextFortressLink
        href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`}
        sx={{
          textDecoration: 'none',
        }}
      >
        <Button
          variant="outlined"
          sx={(theme) => ({
            color: theme.palette.brand.maroonVelvet[500],
            borderColor: theme.palette.brand.maroonVelvet[500],
          })}
        >
          GO SHOPPING
        </Button>
      </NextFortressLink>
    </Stack>
  );
};

export { EmptyWishlist };
