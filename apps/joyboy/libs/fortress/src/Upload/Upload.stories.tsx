import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Upload } from './Upload';
import { useUpload } from './useUpload';
import { Box } from '@mui/joy';

const meta: Meta<typeof Upload> = {
  title: 'Components/Upload',
  component: Upload,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Upload>;

// 静态展示的 stories
export const Uploading: Story = {
  args: {
    fileName: 'file.csv',
  },
};

export const Uploaded: Story = {
  args: {
    fileName: 'file.csv',
  },
};

export const Error: Story = {
  args: {
    fileName: 'file.csv',
    errorMessage: 'The file format is not supported',
  },
};

export const ErrorWithoutFile: Story = {
  args: {
    errorMessage: 'This is a required field',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledWithFile: Story = {
  args: {
    disabled: true,
    fileName: 'file.csv',
  },
};

// 带实际交互的 stories
const InteractiveUpload = () => {
  const upload = useUpload({
    accept: '.csv,.xlsx,.xls',
    maxSize: 5 * 1024 * 1024, // 5MB
    onSuccess: (file) => {
      console.log('Upload success:', file);
    },
    onError: (error) => {
      console.log('Upload error:', error);
    },
  });

  return <Upload fileName={upload.fileName} errorMessage={upload.errorMessage} onUpload={upload.handleUpload} />;
};

export const Default: Story = {
  render: () => <InteractiveUpload />,
};

export const WithError: Story = {
  args: {
    errorMessage: 'This is a required field',
    required: true,
  },
};

export const WithValue: Story = {
  args: {
    fileName: 'example.csv',
  },
};

export const AllStates: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <InteractiveUpload />
      <Upload errorMessage="This is a required field" required />
      <Upload disabled />
      <Upload fileName="example.csv" />
    </Box>
  ),
};
