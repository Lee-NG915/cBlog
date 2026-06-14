// import { Textarea, TextareaProps } from './Textarea';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, FormControl, FormLabel, Typography, Textarea } from '@mui/joy';
import { FormHelperText } from '../FormHelperText';
import React from 'react';
/**
 * Storybook story for the Textarea component.
 * Dev Doc  https://castlery.atlassian.net/wiki/spaces/EC/pages/2866872410/CDD
 * This component renders a Joy UI Textarea and demonstrates its various features.
 */

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
} as Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Primary: Story = {
  render: () => {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Textarea defaultValue="Default" />
        <Textarea placeholder="...Default" />
        <Textarea error defaultValue="Error" />
        <Textarea error placeholder="...Error" />
        <Textarea disabled defaultValue="Disabled" />
      </Box>
    );
  },
};

export const ErrorTextarea: Story = {
  render: () => {
    return (
      <FormControl error>
        <FormLabel>Error Example</FormLabel>
        <Textarea placeholder="Enter text here..." />
        <FormHelperText>Error Message</FormHelperText>
      </FormControl>
    );
  },
};

const TextareaWithCharacterCount = () => {
  const [text, setText] = React.useState('');
  const maxLength = 10;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    // 手动限制字符数
    if (value.length <= maxLength) {
      setText(value);
    }
  };

  return (
    <>
      Normal:
      <Textarea
        placeholder="Type in here…"
        value={text}
        onChange={handleChange}
        endDecorator={
          <Typography
            level="body2"
            sx={{
              ml: 'auto',
            }}
          >
            {text.length}/{maxLength}
          </Typography>
        }
        sx={{ minWidth: 300 }}
      />
      Error:
      <Textarea
        placeholder="Type in here…"
        error
        value={text}
        onChange={handleChange}
        endDecorator={
          <Typography
            level="body2"
            sx={{
              mt: 1,
              ml: 'auto',
            }}
          >
            {text.length}/{maxLength}
          </Typography>
        }
        sx={{ minWidth: 300 }}
      />
      Disabled:
      <Textarea
        placeholder="Type in here…"
        disabled
        value={text}
        onChange={handleChange}
        endDecorator={
          <Typography
            level="body2"
            sx={{
              mt: 1,
              ml: 'auto',
            }}
          >
            {text.length}/{maxLength}
          </Typography>
        }
        sx={{ minWidth: 300 }}
      />
    </>
  );
};

export const TextareaDecorators: Story = {
  render: () => <TextareaWithCharacterCount />,
};
