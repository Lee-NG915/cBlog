import type { Meta, StoryObj } from '@storybook/react';

import { Stack } from '@mui/joy';
import CountrySelector from './CountrySelectorUI';

const countries = [
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
];

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'playground / CountrySelector',
  component: CountrySelector,
  parameters: {},
  argTypes: {
    // mode: {
    //   options: ['', 'simple'],
    //   control: { type: 'radio' },
    // },
    countries: {
      defaultValue: countries,
      control: 'object',
    },
  },
} as Meta<typeof CountrySelector>;

export default meta;
type Story = StoryObj<typeof CountrySelector>;

// export const Empty: Story = {};

export const Primary: Story = {
  // args: {},
  // parameters: {},
  render: (args) => <CountrySelector defaultValue="/us" {...args} countries={countries} />,
};

export const countrySelector = () => <CountrySelector defaultValue="/us" countries={countries} />;
export const sizes = () => (
  <Stack>
    <CountrySelector size="sm" countries={countries} defaultValue="/us" />
    <CountrySelector size="md" countries={countries} defaultValue="/us" />
  </Stack>
);
export const modes = () => <CountrySelector size="sm" mode="simple" countries={countries} defaultValue="/us" />;
