import type { Meta, StoryObj } from '@storybook/react';
import { AddressCard } from './address-card';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof AddressCard> = {
  component: AddressCard,
  title: 'module/user/address/AddressCard',
};
export default meta;
type Story = StoryObj<typeof AddressCard>;

export const New = {
  args: {},
};
export const Existing = {
  args: {
    address: {
      id: 203495,
      firstname: 'S',
      lastname: 'T',
      address1: '15 Holland Hill',
      phone: '+65 3333 3333',
      zipcode: '278735',
      address2: '15 Holland Hill',
      city: 'Singapore',
      street: 'Holland Hill',
      building_name: '15 Holland Hill',
      street_number: '15',
      is_temporary: false,
      building_type: 'Condo / Apartment',
      is_valid: true,
      is_shippable: true,
      country: 'Singapore',
    },
  },
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to AddressCard!/gi)).toBeTruthy();
  },
};
