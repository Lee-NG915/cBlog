import type { Meta, StoryObj } from '@storybook/react';

import { Account, AccountLogin, Favorite, Search, ShoppingBag } from '@castlery/fortress/Icons';
import { Badge, IconButton, Link, Stack } from '@castlery/fortress';
import CountrySelector from 'components/CountrySelector/CountrySelectorUI';
import { GlobalNavUI } from './components';
// import { RouterLink } from 'components/RouterLink';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'playground / Header',
};

export default meta;
type Story = StoryObj;

// export const Primary: Story = {
//   args: {},
//   parameters: {},
// };

export const icons = () => (
  <Stack direction="row" spacing={2}>
    <IconButton size="md">
      <Account />
    </IconButton>
    <IconButton size="md">
      <AccountLogin />
    </IconButton>
    <IconButton size="md">
      <Search />
    </IconButton>
    <IconButton size="md">
      <ShoppingBag />
    </IconButton>
    <IconButton size="md">
      <Favorite />
    </IconButton>
    <IconButton size="md">
      <Badge badgeContent="200" loading>
        <ShoppingBag />
      </Badge>
    </IconButton>
    <IconButton size="md">
      <Badge badgeContent="1">
        <ShoppingBag />
      </Badge>
    </IconButton>
    <IconButton size="md">
      <Badge badgeContent="20">
        <ShoppingBag />
      </Badge>
    </IconButton>
    <IconButton size="md">
      <Badge badgeContent="200">
        <ShoppingBag />
      </Badge>
    </IconButton>

    <IconButton size="md">
      <Badge badgeContent="200" loading>
        <Favorite />
      </Badge>
    </IconButton>
    <IconButton size="md">
      <Badge badgeContent="1">
        <Favorite />
      </Badge>
    </IconButton>
    <IconButton size="md">
      <Badge badgeContent="20">
        <Favorite />
      </Badge>
    </IconButton>
    <IconButton size="md">
      <Badge badgeContent="200">
        <Favorite />
      </Badge>
    </IconButton>
  </Stack>
);

export const globalNav = () => (
  <GlobalNavUI>
    <Link>Short-term Campaign</Link>
    <Link>Virtual Studio</Link>
    <Link>Reviews</Link>
    <Link>My Rewards</Link>
    <Link>Contact Us</Link>
    <CountrySelector
      countries={[
        {
          key: 'us',
          code: 'US',
          route: '/us',
          name: 'United States',
          display: 'U.S.',
          icon: 'us-flag',
          lang: 'en-US',
        },
        {
          key: 'sg',
          code: 'SG',
          route: '/sg',
          name: 'Singapore',
          display: 'Singapore',
          icon: 'sg-flag',
          lang: 'en-SG',
        },
        {
          key: 'au',
          code: 'AU',
          route: '/au',
          name: 'Australia',
          display: 'Australia',
          icon: 'au-flag',
          lang: 'en-AU',
        },
      ]}
      defaultValue="/us"
      showIcon={false}
    />
  </GlobalNavUI>
);
