// List.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import { List, ListItem, ListSubheader, ListItemButton } from './index';
import { useState } from 'react';
import { Switch } from '@mui/joy';
import { Typography } from '..';

const meta: Meta<typeof List> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/List',
  component: List,
};

export default meta;

type Story = StoryObj<typeof List>;
export const NestedList: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByText('Category 1');
    expect(list).toBeInTheDocument();
    const listItems = canvas.getByText('Subitem 11');
    expect(listItems).toBeInTheDocument();
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [small, setSmall] = useState(false);
    return (
      <div>
        <Switch
          size="sm"
          checked={small}
          onChange={(event) => setSmall(event.target.checked)}
          endDecorator={<Typography level="body-sm">Toggle small nested list</Typography>}
          sx={{ mb: 2 }}
        />
        <List
          variant="outlined"
          size={small ? 'sm' : undefined}
          sx={{
            width: 200,
            borderRadius: 'sm',
          }}
        >
          <ListItem nested>
            <ListSubheader>Category 1</ListSubheader>
            <List>
              <ListItem>
                <ListItemButton>Subitem 11</ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton>Subitem 12</ListItemButton>
              </ListItem>
            </List>
          </ListItem>
          <ListItem nested>
            <ListSubheader>Category 2</ListSubheader>
            <List>
              <ListItem>
                <ListItemButton>Subitem 21</ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton>Subitem 22</ListItemButton>
              </ListItem>
            </List>
          </ListItem>
        </List>
      </div>
    );
  },
};
