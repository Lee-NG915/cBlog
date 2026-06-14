import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Card, CardContent, CardOverflow, CardCover, CardActions } from './index';
import type { CardProps, CardContentProps, CardCoverProps, CardActionsProps, CardOverflowProps } from './index';
import { Button } from '../Button';
import { Typography } from '../Typography';
import { Link } from '../Link';
import { Box } from '../index';
import { FavoriteFilled } from 'fortress/Icons';
import { IconButton } from '../index';
import AspectRatio from '@mui/joy/AspectRatio';

const meta: Meta<CardProps> = {
  title: 'fortress/Card',
  component: Card,
  // subcomponents: { CardContent, CardCover, CardActions, CardOverflow },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?type=design&node-id=2%3A81&mode=dev',
    },
  },
};
export default meta;

export const Basics: StoryObj<CardProps> = {
  render: (args) => (
    <Card {...args} sx={{ width: 320 }}>
      {/* <CardCover>
        <img
          src="https://res.cloudinary.com/castlery/image/upload/w_1280,f_auto,q_auto/v1700207237/static/landing/Free-Swatches.jpg"
          alt="placeholder"
        />
      </CardCover> */}
      <CardOverflow>
        <AspectRatio ratio="3">
          <img
            src="https://res.cloudinary.com/castlery/image/upload/w_1280,f_auto,q_auto/v1700207237/static/landing/Free-Swatches.jpg"
            srcSet="https://res.cloudinary.com/castlery/image/upload/w_1280,f_auto,q_auto/v1700207237/static/landing/Free-Swatches.jpg 2x"
            loading="lazy"
            alt=""
          />
        </AspectRatio>
      </CardOverflow>
      <CardContent>
        <Typography level="h2" textColor="brand.charcoal.500">
          Yosemite National Park
        </Typography>
        <Typography level="h3" textColor="brand.charcoal.400">
          California
        </Typography>
      </CardContent>
      <CardOverflow>
        <CardActions>
          <Button>Button</Button>
          <Button>Button</Button>
        </CardActions>
      </CardOverflow>
    </Card>
  ),
};

export const MediaCard: StoryObj<CardProps> = {
  render: (args) => (
    <Box component="ul" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', p: 0, m: 0 }}>
      <Card component="li" sx={{ minWidth: 300, flexGrow: 1 }}>
        <CardCover>
          <img
            src="https://res.cloudinary.com/castlery/image/upload/w_1280,f_auto,q_auto/v1700207237/static/landing/Free-Swatches.jpg"
            srcSet="https://res.cloudinary.com/castlery/image/upload/w_1280,f_auto,q_auto/v1700207237/static/landing/Free-Swatches.jpg 2x"
            loading="lazy"
            alt=""
          />
        </CardCover>
        <CardContent>
          <Typography level="h3" fontWeight="lg" textColor="#fff" mt={{ xs: 12, sm: 18 }}>
            Image
          </Typography>
        </CardContent>
      </Card>
      <Card component="li" sx={{ minWidth: 300, flexGrow: 1 }}>
        <CardCover>
          <video
            autoPlay
            loop
            muted
            poster="https://res.cloudinary.com/castlery/image/upload/w_1920,f_auto,q_auto/v1699932396/Brand%20and%20Content/Brand%20Campaigns/Limited%20Edition%20Campaign/L_1.jpg"
          >
            <source
              src="https://res.cloudinary.com/castlery/video/upload/c_fill,w_1920/f_auto/v1/Brand%20and%20Content/Brand%20Campaigns/Limited%20Edition%20Campaign/26102023_Microsite_Limited_Edition_Desktop_1728x576.webm?_a=ATAPpAA0"
              type="video/mp4"
            />
          </video>
        </CardCover>
        <CardContent>
          <Typography level="h3" fontWeight="lg" textColor="#fff" alignSelf="end">
            Video
          </Typography>
        </CardContent>
      </Card>
    </Box>
  ),
};

export const Variants: StoryObj<CardProps> = {
  render: (args) => (
    <Card
      variant="outlined"
      sx={{
        width: 320,
        // to make the card resizable
        overflow: 'auto',
        resize: 'horizontal',
      }}
    >
      <CardOverflow
        sx={
          {
            // py: 2,
          }
        }
      >
        <AspectRatio ratio="2">
          <img
            src="https://res.cloudinary.com/castlery/image/upload/w_1280,f_auto,q_auto/v1700207237/static/landing/Free-Swatches.jpg"
            srcSet="https://res.cloudinary.com/castlery/image/upload/w_1280,f_auto,q_auto/v1700207237/static/landing/Free-Swatches.jpg 2x"
            loading="lazy"
            alt=""
          />
        </AspectRatio>
      </CardOverflow>
      <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Typography level="h3">Maui Loveseat Set</Typography>
        <Typography level="caption1">Loveseat, Lounge Chairs & Coffee Tablewwwwwwww</Typography>
      </CardContent>
      <CardActions buttonFlex="1 1 100px">
        <Button variant="secondary" color="neutral">
          Add to cart
        </Button>
        <IconButton variant="outlined" color="neutral">
          <FavoriteFilled color="primary" />
        </IconButton>
      </CardActions>
    </Card>
  ),
};
