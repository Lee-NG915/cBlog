/* eslint-disable @typescript-eslint/no-unused-vars */
// Divider.stories.ts|tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button, Stack, Typography } from '..';
import { DatePicker, DatePickerProps, DateRange } from './DatePicker';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Datepicker',
  component: DatePicker,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} as Meta<DatePickerProps>;
export default meta;

type Story = StoryObj<DatePickerProps>;

export const Primary: Story = {
  args: {
    mode: 'single',
    actionComponent: (props) => <Button {...props}>Open Calendar</Button>,
  },
  render: (args: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState<Date | undefined>(undefined);

    const onSelect = (date: Date) => {
      console.log('onSelect', date);
      setSelected(date);
    };

    return (
      <Stack>
        <DatePicker {...args} selected={selected} onSelect={onSelect} />
      </Stack>
    );
  },
};

export const MultipleDatePickerStory: Story = {
  args: {
    mode: 'multiple',
    min: 2,
    max: 4,
    actionComponent: (props) => <Button {...props}>Open Calendar</Button>,
  },
  render: (args: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState<Date[] | undefined>(undefined);

    const onSelect = (dates: Date[]) => {
      console.log('MultipleDatePickerStory onSelect:', dates);
      setSelected(dates);
    };

    return (
      <Stack>
        <DatePicker {...args} selected={selected} onSelect={onSelect} />
      </Stack>
    );
  },
};

export const RangeDatePickerStory: Story = {
  args: {
    mode: 'range',
    max: 7,
    excludeDisabled: true,
    actionComponent: (props) => <Button {...props}>Open Calendar</Button>,
  },
  render: (args: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState<DateRange | undefined>(undefined);

    const onSelect = (dateRange: DateRange) => {
      console.log('RangeDatePickerStory onSelect:', dateRange);
      setSelected(dateRange);
    };

    return (
      <Stack spacing={1}>
        <DatePicker {...args} selected={selected} onSelect={onSelect} />
      </Stack>
    );
  },
};

export const DatePickerWithHeaderAndFooterStory: Story = {
  args: {
    mode: 'single',
    showCloseButton: true,
    actionComponent: (props) => <Button {...props}>Open Calendar</Button>,
    header: (
      <Stack
        spacing={2}
        textAlign={'center'}
        sx={{
          color: (theme) => theme.palette.text.primary,
        }}
      >
        <Typography level="h3">This is a H3 title</Typography>
        <Typography level="body2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
        </Typography>
      </Stack>
    ),
    footer: (
      <Stack spacing={6}>
        <Typography level="caption2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </Typography>
        <Button variant="secondary" onConfirm={() => {}}>
          Confirm
        </Button>
      </Stack>
    ),
  },
  render: (args: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState<Date | undefined>(undefined);

    const onSelect = (date: Date) => {
      console.log('onSelect', date);
      setSelected(date);
    };

    return (
      <Stack spacing={1}>
        <DatePicker {...args} selected={selected} onSelect={onSelect} />
      </Stack>
    );
  },
};

export const YearMonthPickerStory: Story = {
  args: {
    mode: 'ym',
    actionComponent: (props) => <Button {...props}>Open Calendar</Button>,
  },
  render: (args: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState<Date | undefined>(undefined);

    const onSelect = (date: Date) => {
      console.log('YMPicker onSelect:', date);
      setSelected(date);
    };

    return <DatePicker {...args} selected={selected} onSelect={onSelect} />;
  },
};
