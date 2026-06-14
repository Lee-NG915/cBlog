import React from 'react';
import type { StoryObj } from '@storybook/react';
import { Button, Box, Typography, Link, NiceModal, type NiceModalProps } from 'fortress';
type Story = StoryObj<NiceModalProps>;

const args = {
  title: 'Do you lorem ipsum? Do you lorem ipsum?',
  desc: 'Action consequence text - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
  subDesc:
    'Action consequence text - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
  modalRole: 'dialog',
  confirmText: 'Submit',
  border: true,
  success: false,
  warning: false,
  information: false,
  danger: false,
  showDefaultFooter: true,
  showCancelBtn: true,
  showConfirmBtn: true,
  keepMounted: false,
  disableEnforceFocus: false,
  disableAutoFocus: false,
  hideBackdrop: false,
  disablePortal: false,
  modalRef: null,
  isSilent: true,
  // beforeClose: (_, reason) => alert(`Before close: close reason [ ${reason} ]`),
  onCancel: () => alert('Confirm To Cancel?'),
  onConfirm: () => alert('Confirm to Submit?'),
};
/**
 * The components in NiceModal are all developed based on BaseModal
 */
export const BaseModalStory: Story = {
  //@ts-ignore
  args: { ...args, showCancelBtn: false },
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <Box sx={{ m: 10, border: '1px solid black', p: 4, textAlign: 'center', minHeight: 600 }}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Click To Open The Standard Modal:
        </Typography>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <NiceModal {...args} open={open} onClose={() => setOpen(false)} />
      </Box>
    );
  },
};

export const BaseModalStoryActions: Story = {
  //@ts-ignore
  args: { ...args, showCancelBtn: true },
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <Box sx={{ m: 10, border: '1px solid black', p: 4, textAlign: 'center', minHeight: 600 }}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Click To Open The Standard Modal:
        </Typography>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <NiceModal {...args} open={open} onClose={() => setOpen(false)} />
      </Box>
    );
  },
};

export const BaseModalStorySuccess: Story = {
  //@ts-ignore
  args: { ...args, showCancelBtn: false, success: true },
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <Box sx={{ m: 10, border: '1px solid black', p: 4, textAlign: 'center', minHeight: 600 }}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Click To Open The Success Modal:
        </Typography>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <NiceModal {...args} open={open} onClose={() => setOpen(false)} />
      </Box>
    );
  },
};
export const BaseModalStoryInformation: Story = {
  //@ts-ignore
  args: { ...args, information: true },
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <Box sx={{ m: 10, border: '1px solid black', p: 4, textAlign: 'center', minHeight: 600 }}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Click To Open The Information Modal:
        </Typography>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <NiceModal {...args} open={open} onClose={() => setOpen(false)} />
      </Box>
    );
  },
};
export const BaseModalStoryWarning: Story = {
  //@ts-ignore
  args: { ...args, warning: true },
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <Box sx={{ m: 10, border: '1px solid black', p: 4, textAlign: 'center', minHeight: 600 }}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Click To Open The Waring Modal:
        </Typography>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <NiceModal {...args} open={open} onClose={() => setOpen(false)} />
      </Box>
    );
  },
};
export const BaseModalStoryDanger: Story = {
  //@ts-ignore
  args: { ...args, danger: true },
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <Box sx={{ m: 10, border: '1px solid black', p: 4, textAlign: 'center', minHeight: 600 }}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Click To Open The Danger Modal:
        </Typography>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <NiceModal {...args} open={open} onClose={() => setOpen(false)} />
      </Box>
    );
  },
};
