import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography } from '@castlery/fortress';
import { WebCheckoutLayout } from './web-checkout-layout';

const meta: Meta<typeof WebCheckoutLayout> = {
  component: WebCheckoutLayout,
  title: 'module/checkout/WebCheckoutLayout',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof WebCheckoutLayout>;

const primaryPanel = (
  <Box
    sx={{
      minHeight: 480,
      p: 6,
      borderRadius: 4,
      backgroundColor: '#f4ede5',
    }}
  >
    <Typography level="h3" sx={{ mb: 3 }}>
      Checkout Content
    </Typography>
    <Typography level="body1">
      Used to validate desktop and mobile spacing, header and footer anchoring, and split-column behavior.
    </Typography>
  </Box>
);

const dividerPanel = <Box sx={{ display: { xs: 'none', md: 'block' }, backgroundColor: 'divider' }} />;

const summaryPanel = (
  <Box
    sx={{
      minHeight: 480,
      p: 6,
      borderRadius: 4,
      backgroundColor: '#ece3d6',
    }}
  >
    <Typography level="h4" sx={{ mb: 3 }}>
      Order Summary
    </Typography>
    <Typography level="body1">Summary panel placeholder for the desktop multi-column checkout layout.</Typography>
  </Box>
);

export const SplitLayout: Story = {
  args: {
    useSingleChildLayout: false,
    children: (
      <>
        {primaryPanel}
        {dividerPanel}
        {summaryPanel}
      </>
    ),
  },
};

export const SingleChildLayout: Story = {
  args: {
    useSingleChildLayout: true,
    children: primaryPanel,
  },
};
