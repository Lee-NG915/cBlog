'use client';

import { Button, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ScrollWrapper } from '@castlery/shared-components';
import { HoverVerticalCard, HoverVerticalCardProps } from './hover-vertical-card';

type HoverListingProps = {
  header: string;
  items: HoverVerticalCardProps[];
};

const HoverListing = ({ header, items }: HoverListingProps) => {
  const { desktop } = useBreakpoints();

  if (!desktop) {
    return (
      <Stack
        sx={(theme) => ({
          width: '100%',
          padding: desktop ? '32px' : '24px',
          paddingRight: 0,
          backgroundColor: theme.palette.brand.warmLinen[500],
        })}
      >
        <Stack
          sx={{
            mb: '24px',
            paddingRight: '32px',
          }}
        >
          <Typography
            level="h3"
            sx={(theme) => ({
              color: theme.palette.brand.maroonVelvet[500],
            })}
          >
            {header}
          </Typography>
          <Stack
            sx={{
              width: 'fit-content',
            }}
          ></Stack>
        </Stack>
        <Stack>
          <ScrollWrapper hideTrack={false} hideDesktopAction={true} hideBottomAction={true} sx={{ pt: 0 }}>
            <Stack
              direction="row"
              sx={{
                width: 'fit-content',
                minWidth: '100%',
                gap: '8px',
              }}
            >
              {items.map((item) => (
                <Stack
                  sx={{
                    flex: '0 0 auto',
                    width: desktop ? 600 : 270,
                  }}
                >
                  <HoverVerticalCard
                    onClickChange={item.onClickChange}
                    header={item.header}
                    image={item.image}
                    button={item.button}
                  />
                </Stack>
              ))}
            </Stack>
          </ScrollWrapper>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      sx={(theme) => ({
        width: '100%',
        padding: '40px 0 40px 32px',
        backgroundColor: theme.palette.brand.warmLinen[500],
        flexDirection: 'column',
        alignItems: 'flex-start',
      })}
    >
      <Typography
        level="h3"
        sx={(theme) => ({
          color: theme.palette.brand.maroonVelvet[500],
        })}
      >
        {header}
      </Typography>
      <Stack
        sx={(theme) => ({
          width: '100%',
          overflow: 'hidden',
          flex: 1,
        })}
      >
        <ScrollWrapper hideTrack={false} hideDesktopAction={true} hideBottomAction={true}>
          <Stack
            direction="row"
            sx={{
              width: 'fit-content',
              minWidth: '100%',
              gap: '24px',
            }}
          >
            {items.map((item) => (
              <Stack
                sx={{
                  flex: '0 0 auto',
                  width: 520,
                }}
              >
                <HoverVerticalCard
                  header={item.header}
                  image={item.image}
                  button={item.button}
                  onClickChange={item.onClickChange}
                />
              </Stack>
            ))}
          </Stack>
        </ScrollWrapper>
      </Stack>
    </Stack>
  );
};

export { HoverListing, HoverListingProps };
