// Checkbox.stories.ts|tsx
import React from 'react';
import Checkbox, { CheckboxProps } from '.';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, FormControl, FormHelperText, Link } from '@mui/joy';
import { Close } from '../Icons';
import { Typography } from '..';
import { userEvent, within, expect } from '@storybook/test';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=2%3A77&mode=dev',
    },
  },
} as Meta<CheckboxProps<'span'>>;
export default meta;

type Story = StoryObj<CheckboxProps>;

export const Primary: Story = {
  args: {
    label: `Label`,
  },
  render: (args) => {
    return <Checkbox {...args} />;
  },
};

export const BasicCheckbox: Story = {
  render: (args) => (
    <>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Checkbox label="Label" {...args} />
        <Checkbox label="Label" defaultChecked {...args} />
      </Box>
      <Box sx={{ display: 'flex', gap: 3, marginTop: 4 }}>
        <Checkbox label="Label" disabled {...args} />
        <Checkbox label="Label" defaultChecked disabled {...args} />
      </Box>
    </>
  ),
};

export function CheckboxVariants() {
  return (
    <>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Checkbox label="Solid" variant="solid" />
        <Checkbox label="Soft" variant="soft" />
        <Checkbox label="Outlined" variant="outlined" />
        <Checkbox label="Plain" variant="plain" />
      </Box>
      <Box sx={{ display: 'flex', gap: 3, marginTop: 4 }}>
        <Checkbox label="Solid" variant="solid" defaultChecked />
        <Checkbox label="Soft" variant="soft" defaultChecked />
        <Checkbox label="Outlined" variant="outlined" defaultChecked />
        <Checkbox label="Plain" variant="plain" defaultChecked />
      </Box>{' '}
    </>
  );
}

export function IconsCheckbox() {
  return <Checkbox uncheckedIcon={<Close />} label="I have an icon when unchecked" />;
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

export const IndeterminateCheckbox: Story = {
  render: () => {
    return <IndeterminateCheckboxExample />;
  },
};

export const WithHelperText: Story = {
  render: () => {
    return (
      <FormControl>
        <Checkbox
          label={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography level="body2">Label</Typography>
              <FormHelperText>Helper text</FormHelperText>
            </Box>
          }
        />
      </FormControl>
    );
  },
};

export const HelperTextCheckbox: Story = {
  render: () => {
    return (
      <Box>
        <Checkbox label="Label" />
        <FormHelperText>
          <Typography level="caption2" color="neutral">
            Helper text
          </Typography>
        </FormHelperText>
      </Box>
    );
  },
};
function IndeterminateCheckboxExample() {
  // ✅ 更好的状态管理：使用对象而不是数组
  const [checkboxState, setCheckboxState] = React.useState({
    parent: false,
    child1: false,
    child2: false,
  });

  // ✅ 计算父级状态
  const isParentChecked = checkboxState.child1 && checkboxState.child2;
  const isParentIndeterminate = checkboxState.child1 !== checkboxState.child2;

  // ✅ 父级复选框处理
  const handleParentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setCheckboxState({
      parent: isChecked,
      child1: isChecked,
      child2: isChecked,
    });
  };

  // ✅ 子级复选框处理
  const handleChildChange = (childKey: 'child1' | 'child2') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxState((prev) => ({
      ...prev,
      [childKey]: event.target.checked,
    }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl>
        <Checkbox
          label="Parent Category"
          checked={isParentChecked}
          indeterminate={isParentIndeterminate}
          onChange={handleParentChange}
        />
        <FormHelperText>
          <Typography level="caption2" color="neutral">
            Select all subcategories
          </Typography>
        </FormHelperText>
      </FormControl>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 3 }}>
        <FormControl>
          <Checkbox label="Subcategory 1" checked={checkboxState.child1} onChange={handleChildChange('child1')} />
        </FormControl>

        <FormControl>
          <Checkbox label="Subcategory 2" checked={checkboxState.child2} onChange={handleChildChange('child2')} />
        </FormControl>
      </Box>
    </Box>
  );
}
