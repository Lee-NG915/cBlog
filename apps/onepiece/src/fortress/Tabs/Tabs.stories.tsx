import { Tabs, TabList, Tab, TabPanel } from './index';
import { tabClasses } from './index';
import type { TabProps } from './index';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import { Tiktok, Facebook } from 'fortress/Icons';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/Tabs',
  component: Tabs,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?type=design&node-id=159%3A1948&mode=dev',
    },
  },
} as Meta<TabProps>;
export default meta;

export const Basics: StoryObj<TabProps> = {
  render: (args) => (
    <Tabs {...args}>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
      <TabPanel value={0}>Tab 1 content</TabPanel>
      <TabPanel value={1}>Tab 2 content</TabPanel>
      <TabPanel value={2}>Tab 3 content</TabPanel>
    </Tabs>
  ),
};

/**
 * icon Tab
 */
export const Icon: StoryObj<TabProps> = {
  render: (args) => (
    <Tabs {...args}>
      <TabList>
        <Tab>
          {' '}
          <ListItemDecorator>
            <Tiktok fontSize="xl3" />
          </ListItemDecorator>
          Tiktok
        </Tab>
        <Tab>
          <ListItemDecorator>
            <Facebook fontSize="xl3" />
          </ListItemDecorator>
          Facebook
        </Tab>
      </TabList>
      <TabPanel value={0}>Tab 1 content</TabPanel>
      <TabPanel value={1}>Tab 2 content</TabPanel>
    </Tabs>
  ),
};

/**
 * Nav Tab
 */
export const Nav: StoryObj<TabProps> = {
  render: (args) => (
    <Tabs {...args}>
      <TabList
        disableUnderline
        sx={(theme) => {
          console.log(theme);
          return {
            p: 0.5,
            [`& .${tabClasses.root}[aria-selected="true"]`]: {
              borderColor: 'neutral.500',
            },
            [`& .${tabClasses.root}`]: {
              border: '1px solid',
              borderRight: 'none',
            },
            [`& .${tabClasses.root}[data-first-child]`]: {
              borderLeft: 'none',
            },
            [`& .${tabClasses.root}:hover`]: {
              borderColor: 'neutral.500',
            },
          };
        }}
      >
        <Tab disableIndicator>Tab 1</Tab>
        <Tab disableIndicator>Tab 2</Tab>
        <Tab disableIndicator>Tab 3</Tab>
      </TabList>
      <TabPanel value={0}>Tab 1 content</TabPanel>
      <TabPanel value={1}>Tab 2 content</TabPanel>
      <TabPanel value={2}>Tab 3 content</TabPanel>
    </Tabs>
  ),
};

/**
 * Button Tab
 */
export const Button: StoryObj<TabProps> = {
  render: (args) => (
    <Tabs {...args}>
      <TabList
        disableUnderline
        sx={(theme) => {
          console.log(theme);
          return {
            px: 2,
            gap: 2,
            [`& .${tabClasses.root}[aria-selected="true"]`]: {
              backgroundColor: 'primary.500',
              color: 'white',
              width: 'auto',
              borderRadius: '20px',
            },
            [`& .${tabClasses.root}`]: {
              px: 4,
            },
          };
        }}
      >
        <Tab disableIndicator>Tab 1</Tab>
        <Tab disableIndicator>Tab 2</Tab>
        <Tab disableIndicator>Tab 3</Tab>
      </TabList>{' '}
      <TabPanel value={0}>Tab 1 content</TabPanel>
      <TabPanel value={1}>Tab 2 content</TabPanel>
      <TabPanel value={2}>Tab 3 content</TabPanel>
    </Tabs>
  ),
};
