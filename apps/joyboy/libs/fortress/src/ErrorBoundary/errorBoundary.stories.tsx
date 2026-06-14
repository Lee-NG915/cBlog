/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary, ErrorBoundaryProps } from './index';
import { within, expect, userEvent } from '@storybook/test';
import { Box } from '..';
const commonPlay = async ({ canvasElement }: any) => {
  const canvas = within(canvasElement);
  const errorPageElement = canvas.getByText('An unexpected error has occurred.');
  expect(errorPageElement).toBeInTheDocument();
};

const meta = {
  title: 'Page/Errorboundary',
  component: ErrorBoundary,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/3M4EAuHdDRBbrL0bYJbfCo/%5BWebsite%5D-2024-Q2-Quick-Fixes?node-id=131-325&m=dev',
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['page', 'component'],
    },
    customContent: {
      control: 'text',
      description: 'custom your error content',
    },
    dyDataCampaign: {
      control: 'text',
      description: 'DY Data Campaign Name',
    },
    retryEvent: {
      description: 'custom default click event',
    },
  },
  play: commonPlay,
} as Meta<ErrorBoundaryProps>;
export default meta;

type Story = StoryObj<ErrorBoundaryProps>;

export const Primary: Story = {
  render: (args) => <ErrorBoundary {...args} />,
};
export const ErrorPageCustomContent: Story = {
  args: {
    customContent: <Box>An unexpected error has occurred.</Box>,
  },
  render: (args) => <ErrorBoundary {...args} />,
};
ErrorPageCustomContent.storyName = 'Use Custom Content';
export const ErrorPageWithRetryEvent: Story = {
  args: {
    type: 'page',
    retryEvent: () => {
      alert('custom retryEvent');
    },
  },
  play: async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);
    const errorPageElement = canvas.getByText('An unexpected error has occurred.');
    expect(errorPageElement).toBeInTheDocument();
    const refreshButton = canvas.getByText('refresh');
    await userEvent.click(refreshButton);
  },
  render: (args) => <ErrorBoundary {...args} />,
};
ErrorPageWithRetryEvent.storyName = 'Use Custom RetryEvent';

export const ErrorPageWithComponent: Story = {
  args: {
    type: 'component',
  },
  render: (args) => <ErrorBoundary {...args} />,
};
ErrorPageWithComponent.storyName = 'Be Used Component';
