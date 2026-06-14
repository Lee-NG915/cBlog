import React from 'react';
import { tabClasses } from '@castlery/fortress/Tabs';
import type { TabProps } from '@castlery/fortress/Tabs';
import { Tabs, TabList, Tab, TabPanel } from '@castlery/fortress';

type ButtonTabsProps = TabProps & {
  tabs: string[];
};

const ButtonTabs: React.FC<ButtonTabsProps> = ({ tabs = [] }) => (
  <Tabs>
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
      {tabs.map((tab, i) => (
        <Tab key={i} disableIndicator>
          {tab}
        </Tab>
      ))}
    </TabList>
    {tabs.map((tab, i) => (
      <TabPanel key={i} value={i}>
        {tab} content
      </TabPanel>
    ))}
  </Tabs>
);

export default ButtonTabs;
