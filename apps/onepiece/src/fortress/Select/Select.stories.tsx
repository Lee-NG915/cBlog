import type { Meta, StoryObj } from '@storybook/react';

import { Dropdown, Option, Select } from './Select';
import { Box, Stack } from '@mui/joy';
import React from 'react';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress / Select',
  component: Select,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=211%3A2769&mode=dev',
    },
  },
} as Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof Select>;

export const Primary: Story = {
  args: {},
  parameters: {},
  render: (args) => {
    const action = React.useRef(null);

    return (
      <Select defaultValue="dog" action={action} {...args}>
        <Option value="dog">Dog</Option>
        <Option value="cat">Cat</Option>
      </Select>
    );
  },
};

export const dropdown = () => {
  let optionConfig = [
    {
      label: 'United States',
      value: 'us',
    },
    {
      label: 'Singapore',
      value: 'sg',
    },
    {
      label: 'Australia',
      value: 'au',
    },
    {
      label: 'China',
      value: 'zh',
      disable: true,
    },
  ];
  return (
    <Stack direction={'row'} justifyContent={'space-between'}>
      <Dropdown
        key="sm"
        size="sm"
        sx={(theme) => ({})}
        onChange={(event, value) => ({})}
        defaultValue={optionConfig[0].value}
      >
        {optionConfig.map((item) => {
          return (
            <Dropdown.Option key={item.value} value={item.value} disabled={item?.disable}>
              {item.label}
            </Dropdown.Option>
          );
        })}
      </Dropdown>
      <Dropdown
        key="md"
        size="md"
        sx={(theme) => ({})}
        onChange={(event, value) => ({})}
        defaultValue={optionConfig[0].value}
      >
        {optionConfig.map((item) => {
          return (
            <Dropdown.Option key={item.value} value={item.value} disabled={item?.disable}>
              {item.label}
            </Dropdown.Option>
          );
        })}
      </Dropdown>
      <Dropdown key={'lg'} size="lg" sx={(theme) => ({})} defaultValue={optionConfig[0].value}>
        {optionConfig.map((item) => {
          return (
            <Dropdown.Option key={item.value} value={item.value} disabled={item?.disable}>
              {item.label}
            </Dropdown.Option>
          );
        })}
      </Dropdown>
    </Stack>
  );
};


export const variants = () => {

  return <Box>

    <Select variant='borderplain'>
      <Option value="">Select</Option>
      <Option value="1">Option 1</Option>
    </Select>
  </Box>
}