/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown, DropdownOption } from './Dropdown';
import { ExpandMore } from '../Icons';
import { Typography } from '../Typography';
const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/wz3fxSlmrXCX1R5ic71pa3/Fortress-2.0?node-id=14337-691&m=dev',
    },
  },

  argTypes: {
    variant: {
      description: '样式变体',
      control: 'select',
      options: ['borderplain', 'form'],
      defaultValue: 'borderplain',
      table: {
        defaultValue: { summary: 'borderplain' },
      },
    },
    color: {
      description: '颜色',
      control: 'select',
      options: ['primary', 'neutral', 'danger', 'info', 'success', 'warning'],
      defaultValue: 'neutral',
      table: {
        defaultValue: { summary: 'neutral' },
      },
    },
    size: {
      description: '尺寸',
      control: 'select',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'sm',
      table: {
        defaultValue: { summary: 'sm' },
      },
    },
    disabled: {
      description: '是否禁用',
      control: 'boolean',
      defaultValue: false,
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      description: '占位文本',
      control: 'text',
    },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof Dropdown>;

const optionConfig = [
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
    value: 'cn',
    disabled: true,
  },
];

export const Default: Story = {
  args: {
    placeholder: 'Select a country',
    size: 'sm',
    listboxOpen: true,
  },
  render: (args) => (
    <Dropdown {...args}>
      {optionConfig.map((item) => (
        <DropdownOption key={item.value} value={item.value} disabled={item.disabled}>
          <Typography level="body1">{item.label}</Typography>
        </DropdownOption>
      ))}
    </Dropdown>
  ),
};

export const FormDropdown: Story = {
  args: {
    variant: 'form',
  },
  render: (args) => (
    <Dropdown {...args} placeholder="Choose your Country">
      {optionConfig.map((item) => (
        <DropdownOption key={item.value} value={item.value} disabled={item.disabled}>
          {item.label}
        </DropdownOption>
      ))}
    </Dropdown>
  ),
};
