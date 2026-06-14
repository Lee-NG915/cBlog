import { Box, Link } from '@castlery/fortress';
import type { Meta } from '@storybook/react';
import { PriceDisplay, PriceDisplayProps, priceDisplayClasses } from './price-display';

const meta: Meta<PriceDisplayProps> = {
  component: PriceDisplay,
  title: 'shared/PriceDisplay',
};
export default meta;

export const Primary = {
  args: {
    price: '1399',
  },
  render: (props: PriceDisplayProps) => {
    return <PriceDisplay {...props} />;
  },
};

export const ShowFree = {
  args: {
    price: '0',
    showFree: true,
  },
  render: (props: PriceDisplayProps) => {
    return <PriceDisplay {...props} />;
  },
};

export const ShowStrikeThroughPrice = {
  args: {},
  render: () => {
    const price = '1999';
    const strikeThroughPrice = '100';
    const showStrikeThroughFree = Number(strikeThroughPrice) === 0;
    const props = {
      price,
      strikeThroughPrice,
      showStrikeThroughFree,
    };

    return <PriceDisplay {...props} />;
  },
};

export const CustomTypographyLevel = {
  args: {
    price: '1999',
    typographyLevel: 'subh1',
  },
  render: (props: PriceDisplayProps) => {
    return <PriceDisplay {...props} />;
  },
};

export const InheritColorState = {
  args: {
    price: '1399',
    strikeThroughPrice: '1999',
  },
  render: (props: PriceDisplayProps) => {
    return (
      <Link
        variant="primary"
        underline="none"
        sx={{
          '&:hover, &:focus, &:active, &:visited': {
            [`& .${priceDisplayClasses.price}`]: {
              color: 'inherit',
            },
          },
        }}
      >
        <PriceDisplay {...props} />
      </Link>
    );
  },
};

export const CustomStyles = {
  args: {
    price: '1399',
    strikeThroughPrice: '1999',
  },
  render: (props: PriceDisplayProps) => {
    return (
      <Box
        sx={{
          [`& .${priceDisplayClasses.price}`]: {
            fontWeight: 'bold',
          },
        }}
      >
        <PriceDisplay {...props} />
      </Box>
    );
  },
};
