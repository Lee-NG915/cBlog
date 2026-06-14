import React from 'react';
import { Breadcrumbs, BreadcrumbsProps } from './Breadcrumbs';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from '@mui/joy';
/**
 * Storybook story for the Breadcrumbs component.
 * Dev Doc  https://castlery.atlassian.net/wiki/spaces/EC/pages/2866872410/CDD
 * This component renders a Breadcrumbs and demonstrates its default usage.
 */

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  //https://storybook.js.org/docs/writing-stories/parameters
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/wz3fxSlmrXCX1R5ic71pa3/Fortress-2.0?node-id=10884-42516&m=dev',
    },
  },
} as Meta<BreadcrumbsProps>;

export default meta;

type Story = StoryObj<BreadcrumbsProps>;

export const Primary: Story = {
  render: () => (
    <Breadcrumbs>
      <Typography>Dr. Zoidberg1</Typography>
      <Typography>Dr. Zoidberg2</Typography>
      <Typography>Dr. Zoidberg3</Typography>
      <Typography>Dr. Zoidberg4</Typography>
    </Breadcrumbs>
  ),
};
