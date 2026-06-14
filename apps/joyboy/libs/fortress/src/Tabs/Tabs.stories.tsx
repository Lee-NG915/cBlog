import { Tabs, TabList, Tab, TabPanel } from './index';
import type { TabProps } from './index';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import { Tiktok, Facebook, Instagram } from '../Icons';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?type=design&node-id=159%3A1948&mode=dev',
    },
  },

  argTypes: {
    orientation: {
      options: ['horizontal', 'vertical'],
      control: { type: 'radio' },
      description: '标签页方向',
    },
    defaultValue: {
      control: 'number',
      description: '默认选中的标签页索引',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

export const Basic: StoryObj<TabProps> = {
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

export const TabsWithIcon: StoryObj<TabProps> = {
  render: (args) => (
    <Tabs {...args}>
      <TabList disableUnderline>
        <Tab disableIndicator>
          <Tiktok fontSize="xl3" />
          TikTok
        </Tab>
        <Tab disableIndicator>
          <Facebook fontSize="xl3" />
          Facebook
        </Tab>
        <Tab disableIndicator>
          <Instagram fontSize="xl3" />
          Instagram
        </Tab>
      </TabList>
      <TabPanel value={0}>TikTok content</TabPanel>
      <TabPanel value={1}>Facebook content</TabPanel>
      <TabPanel value={2}>Instagram content</TabPanel>
    </Tabs>
  ),
};

export const TabsWithoutIcon: StoryObj<TabProps> = {
  render: (args) => (
    <Tabs {...args} orientation="vertical">
      <TabList disableUnderline sx={{ gap: 4 }}>
        <Tab disableIndicator>Option A</Tab>
        <Tab disableIndicator>Option B</Tab>
        <Tab disableIndicator>Option C</Tab>
      </TabList>{' '}
      <TabPanel value={0}>Option A content</TabPanel>
      <TabPanel value={1}>Option B content</TabPanel>
      <TabPanel value={2}>Option C content</TabPanel>
    </Tabs>
  ),
};

export const variantUnderlineTab: StoryObj<TabProps> = {
  render: (args) => (
    <Tabs {...args}>
      <TabList disableUnderline>
        <Tab variant="underline">
          <Tiktok fontSize="xl3" />
          TikTok
        </Tab>
        <Tab variant="underline">
          <Facebook fontSize="xl3" />
          Facebook
        </Tab>
      </TabList>
      <TabPanel value={0}>TikTok content</TabPanel>
      <TabPanel value={1}>Facebook content</TabPanel>
    </Tabs>
  ),
};
