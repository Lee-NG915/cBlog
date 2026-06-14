import type { Meta, StoryObj } from '@storybook/react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Input } from './index';
import { Box, FormControl, FormLabel, Button } from '@mui/joy';
import { Search, CalendarToday, Lock } from '../Icons';
import InputSubscription from './InputSubscription';
import React, { useState } from 'react';
import { FormHelperText } from '../FormHelperText';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Input',
  component: Input,
} as Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof Input>;

export const Primary: Story = {
  args: {},
  parameters: {},
  render: () => {
    return (
      <Box display="flex" flexDirection="column" gap={10}>
        <Input defaultValue={'Default'} variant="borderplain" />
        <Input variant="borderplain" placeholder={'...Default'} />
        <Input error defaultValue={'Error'} />
        <Input error placeholder={'...Error'} />
        <Input disabled defaultValue={'Disabled'} />
      </Box>
    );
  },
};

export const IconInput: Story = {
  args: {},
  parameters: {},
  render: () => {
    return (
      <Input
        clearable
        startDecorator={<Search />}
        endDecorator={<Lock />}
        onChange={() => console.log('清空按钮已点击')}
      />
    );
  },
};

export const ButtonInput: Story = {
  args: {},
  parameters: {},
  render: () => {
    return <Input clearable startDecorator={<Search />} endDecorator={<Button>Button</Button>} />;
  },
};

export const ClearableInput: Story = {
  args: {},
  parameters: {},
  render: () => {
    const ClearableInputDemo = () => {
      const [value1, setValue1] = useState('');
      const [value3, setValue3] = useState('示例文本');

      const handleChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue1(e.target.value);
      };
      const handleChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue3(e.target.value);
      };

      return (
        <Box display="flex" flexDirection="column" gap={4}>
          <Box>
            <p>带清空按钮的输入框 (clearable=true)</p>
            <FormControl>
              <FormLabel>基本输入框</FormLabel>
              <Input
                placeholder="请输入内容..."
                clearable
                value={value1}
                onChange={handleChange1}
                onClear={() => console.log('清空按钮已点击')}
              />
              <FormHelperText>只有在聚焦且有内容时才显示清空按钮</FormHelperText>
            </FormControl>
          </Box>

          <Box>
            <p>带清空按钮和尾部装饰器的输入框</p>
            <FormControl>
              <FormLabel>带日历图标</FormLabel>
              <Input
                placeholder="请输入日期..."
                clearable
                value={value3}
                onChange={handleChange3}
                endDecorator={<CalendarToday />}
                onClear={() => console.log('日期已清空')}
              />
              <FormHelperText>清空按钮会自动向左移动，避免与endDecorator重叠</FormHelperText>
            </FormControl>
          </Box>
        </Box>
      );
    };

    return <ClearableInputDemo />;
  },
};

export { InputSubscription };

export const ErrorInput: Story = {
  args: {},
  parameters: {},
  render: () => {
    return (
      <FormControl error>
        <FormLabel>Error Example</FormLabel>
        <Input />
        <FormHelperText>Error Message</FormHelperText>
      </FormControl>
    );
  },
};
