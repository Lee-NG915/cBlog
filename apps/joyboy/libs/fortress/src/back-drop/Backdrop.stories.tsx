import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Backdrop } from './back-drop';
import { within, expect } from '@storybook/test';
import { Button } from '../Button';
import { CircularProgress } from '@mui/joy';

const meta: Meta<typeof Backdrop> = {
  component: Backdrop,
  title: 'Components/Backdrop',
};
export default meta;
type Story = StoryObj<typeof Backdrop>;

export const Primary = {
  args: {
    open: true,
  },
  play: async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);
    const text = canvas.getAllByText('Hi, I am backdrop!');
    expect(text).toHaveLength(1);
  },
  render: () => {
    return (
      <Backdrop open={true}>
        <h1>Hi, I am backdrop!</h1>
      </Backdrop>
    );
  },
};

export const Heading: Story = {
  args: {},
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState(false);
    const handleClose = () => {
      setOpen(false);
    };
    const handleOpen = () => {
      setOpen(true);
    };

    return (
      <div>
        <Button onClick={handleOpen}>Show backdrop</Button>
        <Backdrop open={open} onClick={handleClose}>
          <CircularProgress color="primary" />
        </Backdrop>
      </div>
    );
  },
};
