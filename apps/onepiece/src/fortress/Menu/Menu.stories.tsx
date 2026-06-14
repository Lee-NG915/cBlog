import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Menu, MenuItem, menuItemClasses } from './index';
import { Box, Button, ListDivider } from '@mui/joy';
import { MenuIconSideNavExample } from './MenuIconSideNavExample';
// import { Dropdown } from '.';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress / Menu',
  component: Menu,
} as Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof Menu>;

export const Primary: Story = {
  render: (props) => {
    console.log('==============>props');
    console.log(props);

    const buttonRef = React.useRef(null);
    const menuActions = React.useRef(null);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
      buttonRef.current?.focus();
    };

    const handleButtonKeyDown = (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setAnchorEl(event.currentTarget);
        if (event.key === 'ArrowUp') {
          menuActions.current?.highlightLastItem();
        }
      }
    };
    return (
      <Box sx={{ pb: 20 }}>
        <Button
          ref={buttonRef}
          id="menu-usage-button"
          aria-controls={open ? 'menu-usage-demo' : undefined}
          aria-haspopup="menu"
          aria-expanded={open ? 'true' : undefined}
          variant="outlined"
          color="neutral"
          onClick={handleClick}
          onKeyDown={handleButtonKeyDown}
        >
          Format
        </Button>
        <Menu
          {...props}
          id="menu-usage-demo"
          anchorEl={anchorEl}
          open={open}
          {...(typeof props.open === 'boolean' && {
            open: props.open,
            anchorEl: buttonRef.current,
          })}
          onClose={handleClose}
          slotProps={{
            listbox: {
              'aria-labelledby': 'menu-usage-button',
            },
          }}
        >
          <MenuItem onClick={handleClose}>Add space before paragraph</MenuItem>
          <MenuItem onClick={handleClose}>Add space after paragraph</MenuItem>
          <ListDivider />
          <MenuItem onClick={handleClose}>Custom spacing...</MenuItem>
        </Menu>
      </Box>
    );
  },
  args: {
    open: true,
  },
  argTypes: {
    variant: {
      control: 'select',
      defaultValue: 'outlined',
      options: ['plain', 'outlined', 'soft', 'solid'],
    },
    open: {
      control: { type: 'radio' },
      // defaultValue: 'open',
      options: ['open'],
    },
  },
};

export function BasicMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-demo-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="outlined"
        color="primary"
        onClick={handleOpen}
        // onMouseEnter={handleOpen}
        onMouseLeave={() => {
          // setTimeout(() => {
          //   handleClose();
          // }, 500);
        }}
      >
        Dashboard
      </Button>

      <Menu
        size="md"
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        aria-labelledby="basic-demo-button"
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </div>
  );
}

export { MenuIconSideNavExample };

export { default as MenuButton } from './MenButton';
