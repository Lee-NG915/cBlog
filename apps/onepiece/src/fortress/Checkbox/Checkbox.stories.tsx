// Checkbox.stories.ts|tsx
import React, { useState } from 'react';
import Checkbox, { CheckboxProps, checkboxClasses } from '.';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, FormControl, FormHelperText, Link } from '@mui/joy';
import { Check, Close } from 'fortress/Icons';
import { Typography, List, ListItem } from 'fortress';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/Checkbox',
  component: Checkbox,
} as Meta<CheckboxProps<'span'>>;
export default meta;

type Story = StoryObj<CheckboxProps>;

export const Primary: Story = {
  args: {
    label: `Label`,
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=2%3A77&mode=dev',
    },
  },
  render: (args) => {
    return (
      <FormControl>
        <Checkbox {...args} />
        <FormHelperText>
          <Typography level="caption2" color="neutral">
            Help text
          </Typography>
        </FormHelperText>
      </FormControl>
    );
  },
};

export const BasicCheckbox: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Checkbox label="Label" {...args} />
      <Checkbox label="Label" defaultChecked {...args} />
    </Box>
  ),
};

export function CheckboxVariants() {
  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Checkbox label="Solid" variant="solid" defaultChecked />
      <Checkbox label="Soft" variant="soft" defaultChecked />
      <Checkbox label="Outlined" variant="outlined" defaultChecked />
      <Checkbox label="Plain" variant="plain" defaultChecked />
    </Box>
  );
}

export function CheckboxSizes() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Checkbox label="Small" size="sm" defaultChecked />
      <Checkbox label="Medium" size="md" defaultChecked />
      <Checkbox label="Large" size="lg" defaultChecked />
    </Box>
  );
}

export function CheckboxColors() {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      <Checkbox label="Primary" color="primary" defaultChecked />
      <Checkbox label="Neutral" color="neutral" defaultChecked />
      <Checkbox label="Danger" color="danger" defaultChecked />
      <Checkbox label="Success" color="success" defaultChecked />
      <Checkbox label="Warning" color="warning" defaultChecked />
    </Box>
  );
}

export function IconsCheckbox() {
  return <Checkbox uncheckedIcon={<Close />} label="I have an icon when unchecked" />;
}

export function HoverCheckbox() {
  return (
    <Checkbox
      uncheckedIcon={<Check />}
      label="My unchecked icon appears on hover"
      slotProps={{
        root: ({ checked, focusVisible }) => ({
          sx: !checked
            ? {
                '& svg': { opacity: focusVisible ? 0.32 : 0 },
                '&:hover svg': {
                  opacity: 0.32,
                },
              }
            : undefined,
        }),
      }}
    />
  );
}
// TODO 这里颜色有问题
export function IconlessCheckbox() {
  return (
    <Box sx={{ width: 343 }}>
      <Typography id="topping" level="body2" fontWeight="lg" mb={2}>
        Pizza toppings
      </Typography>
      <Box role="group" aria-labelledby="topping">
        <List
          orientation="horizontal"
          wrap
          sx={{
            '--List-gap': '8px',
            '--ListItem-radius': '20px',
          }}
        >
          {['Pepperoni', 'Cheese', 'Olives', 'Tomatoes', 'Fried Bacon', 'Spinach'].map((item, index) => (
            <ListItem key={item}>
              <Checkbox disabled={index === 0} overlay disableIcon variant="soft" label={item} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export function FocusCheckbox() {
  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Checkbox
        label="Fully wrapped"
        defaultChecked
        // to demonstrate the focus outline
        slotProps={{ action: { className: checkboxClasses.focusVisible } }}
      />
      <Checkbox
        label="Input wrapped"
        defaultChecked
        sx={{ [`& > .${checkboxClasses.checkbox}`]: { position: 'relative' } }}
        // to demonstrate the focus outline
        slotProps={{ action: { className: checkboxClasses.focusVisible } }}
      />
    </Box>
  );
}

export function SignUpCheckbox() {
  return (
    <FormControl size="sm" sx={{ width: 400 }}>
      <Checkbox
        label={
          <React.Fragment>
            I have read and agree to the <Typography fontWeight="md">terms and conditions</Typography>.
          </React.Fragment>
        }
      />
      <FormHelperText>
        <Typography level="body2">
          Read our <Link href="#link">terms and conditions</Link>.
        </Typography>
      </FormHelperText>
    </FormControl>
  );
}
