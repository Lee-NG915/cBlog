import React from 'react';
import { tabClasses } from '@castlery/fortress/Tabs';

import { Tabs, TabList, Tab } from '@castlery/fortress';

import type { WishlistTabsProps } from './props';

const WishlistTabs: React.FC<WishlistTabsProps> = ({ tabs = [], value, onChange }) => {
  const onChangeEvent = (e: React.SyntheticEvent | null, tabValue: string | number | null) => {
    if (onChange) onChange(e, tabValue);
  };

  return (
    <Tabs value={value} onChange={onChangeEvent}>
      <TabList
        disableUnderline
        sx={() => ({
          px: 2,
          gap: 2,
          justifyContent: 'center',
          [`& .${tabClasses.root}[aria-selected="true"]`]: {
            backgroundColor: 'primary.500',
            color: 'white',
            width: 'auto',
            borderRadius: '20px',
          },
          [`& .${tabClasses.root}`]: {
            px: 3,
          },
        })}
      >
        {tabs.map((tab, i) => (
          <Tab key={i} disableIndicator>
            {tab}
          </Tab>
        ))}
      </TabList>
      {/* {tabs.map((tab, i) => (
      <TabPanel key={i} value={i}>
        {tab} content
      </TabPanel>
    ))} */}
    </Tabs>
  );
};

export default WishlistTabs;
