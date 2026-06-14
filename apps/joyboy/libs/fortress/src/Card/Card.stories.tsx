/* eslint-disable @typescript-eslint/no-unused-vars */
// Card.stories.ts|tsx
import React, { useState } from 'react';
import Card, { CardProps, CardOverflow } from '.';
import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio, Radio, CardContent, Typography, RadioGroup, Container } from '@mui/joy';
import { IconButton } from '../IconButton';
import { Button } from '../Button';
import { within, expect } from '@storybook/test';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Card',
  component: Card,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=2-81&m=dev',
    },
  },
} as Meta<CardProps>;
export default meta;

type Story = StoryObj<CardProps>;

export const Primary: Story = {
  args: {
    label: `Label`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { name: /Yosemite National Park/i });
    expect(heading).toBeInTheDocument();
    const image = canvas.getByRole('img');
    expect(image).toBeInTheDocument();
    const button = canvas.getByRole('button', { name: /Explore/i });
    expect(button).toBeInTheDocument();
    const priceText = canvas.getByText('$2,900');
    expect(priceText).toBeInTheDocument();
  },

  render: (args) => {
    return (
      <Card sx={{ width: 320 }}>
        <div>
          <Typography level="h1">Yosemite National Park</Typography>
          <Typography level="h2">April 24 to May 02, 2021</Typography>
          <IconButton
            aria-label="bookmark Bahamas Islands"
            variant="plain"
            color="neutral"
            size="sm"
            sx={{ position: 'absolute', top: '0.875rem', right: '0.5rem' }}
          >
            {/* <BookmarkAdd /> */}
          </IconButton>
        </div>
        <AspectRatio minHeight="120px" maxHeight="200px">
          <img
            src="https://images.unsplash.com/photo-1527549993586-dff825b37782?auto=format&fit=crop&w=286"
            srcSet="https://images.unsplash.com/photo-1527549993586-dff825b37782?auto=format&fit=crop&w=286&dpr=2 2x"
            loading="lazy"
            alt="A scenic view of Yosemite National Park"
          />
        </AspectRatio>
        <CardContent orientation="horizontal">
          <div>
            <Typography level="body1">Total price:</Typography>
            <Typography fontSize="lg" fontWeight="lg">
              $2,900
            </Typography>
          </div>
          <Button
            variant="solid"
            size="md"
            color="primary"
            aria-label="Explore Bahamas Islands"
            sx={{ ml: 'auto', alignSelf: 'center', fontWeight: 600 }}
          >
            Explore
          </Button>
        </CardContent>
      </Card>
    );
  },
};

// Card + Radio
const FinishIconAndText = ({ iconStyle, text, withButton = false }: any) => {
  return (
    <>
      <div style={{ display: 'flex', width: '254px', justifyContent: 'space-evenly', overflow: 'hidden' }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          style={iconStyle}
        >
          <path d="M9.475 17.575L4.5 12.625L5.225 11.9L9.475 16.15L18.625 7L19.35 7.725L9.475 17.575Z" fill="#00A676" />
        </svg>
        <Typography level={withButton ? 'caption1' : 'body2'}>{text}</Typography>
      </div>
    </>
  );
};
const ErrorIconAndText = ({ iconStyle, text, withButton = false }: any) => {
  return (
    <>
      <div style={{ display: 'flex', width: '254px', justifyContent: 'space-evenly', overflow: 'hidden' }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          style={iconStyle}
        >
          <path
            d="M6.2 18.6L5.5 17.9L11.1 12.3L5.5 6.7L6.2 6L11.8 11.6L17.4 6L18.1 6.7L12.5 12.3L18.1 17.9L17.4 18.6L11.8 13L6.2 18.6Z"
            fill="#CC0025"
          />
        </svg>
        <Typography level={withButton ? 'caption1' : 'body2'}>{text}</Typography>
      </div>
    </>
  );
};

function CardWithRadio({ title, _check, _hover }: any) {
  const [check, setCheck] = useState(_check);
  const [hover, setHovered] = useState(_hover);
  const handleMouseEnter = () => {
    setHovered(true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
  };
  return (
    <Card
      sx={{ width: 286, borderColor: hover ? '#A45B37' : null }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>
        <Typography
          level="h3"
          sx={{
            fontFamily: 'MinervaModern',
            textAlign: 'center',
            fontWeight: 400,
            color: '#6C5D37',
          }}
        >
          {title}
        </Typography>
        <div
          style={{
            height: '33px',
            width: '254px',
            background: '#877445',
          }}
        >
          <Typography
            level="body1"
            sx={{
              color: '#FFFDF9',
              fontSize: 14,
              fontFamily: 'Poppins',
              fontWeight: '400',
              lineHeight: '33px',
              wordWrap: 'break-word',
              textAlign: 'center',
            }}
          >
            Recommended for you
          </Typography>
        </div>
      </div>
      <FinishIconAndText
        iconStyle={{ flexShrink: 0, marginRight: '8px' }}
        text="Delivered to your ground floor at front entrance, lift lobby or foot of stairs."
      />
      <FinishIconAndText
        iconStyle={{ flexShrink: 0, marginRight: '8px' }}
        text="Delivered via courier with signature required."
      />
      <ErrorIconAndText
        iconStyle={{ flexShrink: 0, marginRight: '8px' }}
        text="No scheduling of delivery, carrying up items, unpacking, assembly or rubbish removal."
      />
      <CardOverflow sx={{ borderTop: '1px solid', borderColor: hover ? '#A45B37' : null, padding: 0 }}>
        <Card variant={check ? 'soft' : 'plain'} sx={{ backgroundColor: check ? '#A45B37' : null }}>
          <RadioGroup defaultValue={check ? '1' : '0'}>
            <Radio
              variant="outlined"
              value={'1'}
              onChange={() => {
                setCheck(!check);
              }}
              label={
                <>
                  <Typography level="body2" sx={{ color: check ? '#ffffff' : null }}>
                    Free
                  </Typography>
                </>
              }
              sx={{ width: '100%', flexDirection: 'row-reverse' }}
            />
          </RadioGroup>
        </Card>
      </CardOverflow>
    </Card>
  );
}

export function CartWithRadioVariant() {
  return (
    <>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around' }}>
        <CardWithRadio title="Default" _check={false} _hover={false} />
        <CardWithRadio title="Hover" _check={false} _hover={true} />
        <CardWithRadio title="Selected" _check={true} _hover={true} />
      </div>
    </>
  );
}

// Card + Button
function CardWithButton({ title, discount }: any) {
  return (
    <Card sx={{ width: 286, height: 437 }}>
      <div>
        <Typography level="caption1">Shipping method</Typography>
        <Typography
          level="h3"
          sx={{
            fontFamily: 'MinervaModern',
            textAlign: 'center',
            fontWeight: 400,
            color: '#6C5D37',
          }}
        >
          {title || 'Basic'}
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {discount && (
            <Typography level="subh2" color="success" sx={{ marginRight: '8px' }}>
              Free
            </Typography>
          )}
          <Typography level="body2" sx={{ textDecorationLine: discount ? 'line-through' : null }}>
            +$150
          </Typography>
        </div>
      </div>
      <div
        style={{
          height: '33px',
          width: '254px',
          background: '#877445',
          textAlign: 'center',
        }}
      >
        <Typography
          level="body1"
          sx={{
            color: '#FFFDF9',
            fontSize: 14,
            fontFamily: 'Poppins',
            fontWeight: '400',
            wordWrap: 'break-word',
            textAlign: 'center',
            lineHeight: '33px',
          }}
        >
          Recommended for you
        </Typography>
      </div>
      <FinishIconAndText
        iconStyle={{ flexShrink: 0, marginRight: '8px' }}
        text="Delivered to your ground floor at front entrance, lift lobby or foot of stairs."
        withButton={true}
      />
      <FinishIconAndText
        iconStyle={{ flexShrink: 0, marginRight: '8px' }}
        text="Delivered via courier with signature required."
        withButton={true}
      />
      <ErrorIconAndText
        iconStyle={{ flexShrink: 0, marginRight: '8px' }}
        text="No scheduling of delivery, carrying up items, unpacking, assembly or rubbish removal."
        withButton={true}
      />
      <CardOverflow sx={{ borderTop: '1px solid' }}>
        <Button variant="tertiary" color="neutral">
          Upgrade Plan
        </Button>
      </CardOverflow>
    </Card>
  );
}

export const CartWithButtonVariant = () => {
  return (
    <>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-evenly' }}>
        <CardWithButton title="Add On Price" discount={false} />
        <CardWithButton title="Discount" discount={true} />
      </div>
    </>
  );
};
