import React from 'react';
import { addons, types } from 'storybook/internal/manager-api';

import { Panel } from './components/Panel';
// import { Tab } from './components/Tab';
// import { Tool } from './components/Tool';
import {
  ADDON_ID,
  PANEL_ID,
  // TAB_ID, TOOL_ID
} from './constants';

/**
 * Register the addon
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
addons.register(ADDON_ID, (api) => {
  // Register a tool
  // addons.add(TOOL_ID, {
  //   type: types.TOOL,
  //   title: 'My addon',
  //   match: ({ viewMode, tabId }) => !!((viewMode && viewMode.match(/^(story)$/)) || tabId === TAB_ID),
  //   render: () => <Tool api={api} />,
  // });

  // Register a panel
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Nest Controls',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => <Panel active={active as boolean} />,
  });

  // Register a tab
  // addons.add(TAB_ID, {
  //   type: types.TAB,
  //   title: 'My addon',
  //   render: ({ active }) => <Tab active={active as boolean} />,
  // });
});
