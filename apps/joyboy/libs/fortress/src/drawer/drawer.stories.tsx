import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer, type DrawerProps } from './drawer';

import { Button } from '../Button';
import { Box, Divider, List, ListItem, ListItemButton, Typography, DialogTitle, DialogContent } from '@mui/joy';
import { ModalClose } from '../Modal';

const meta: Meta<DrawerProps> = {
  component: Drawer,
  title: 'Components/Drawer',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=4340-17421&m=dev',
    },
  },
};
export default meta;
type Story = StoryObj<DrawerProps>;

export const Primary: Story = {
  args: {
    title: 'Drawer Title',
    showCloseButton: true,
  },
  argTypes: {},
  parameters: {
    docs: {
      source: {
        code: `
         <Drawer open={open} onClose={handleClose}>
          <ModalClose />
          <DialogTitle>
            <Typography level="h3">I am a title</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography>Content</Typography>
          </DialogContent>
        </Drawer>
        `,
      },
    },
  },
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
      <>
        <Button onClick={handleOpen}>Show Drawer</Button>
        <Drawer open={open} onClose={handleClose}>
          <ModalClose />
          <DialogTitle>
            <Typography level="h3">I am a title</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography>Content</Typography>
          </DialogContent>
        </Drawer>
      </>
    );
  },
};

export function DrawerBasic() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (inOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setOpen(inOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Button variant="outlined" color="neutral" onClick={toggleDrawer(true)}>
        Open drawer
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Box role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text) => (
              <ListItem key={text}>
                <ListItemButton>{text}</ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {['All mail', 'Trash', 'Spam'].map((text) => (
              <ListItem key={text}>
                <ListItemButton>{text}</ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
