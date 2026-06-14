// List.stories.ts|tsx

import type { Meta } from '@storybook/react';

import { List, ListItem, ListSubheader, ListItemButton } from './index';
import { useState } from 'react';
import { Switch } from '@mui/joy';
import { Typography } from 'fortress';

const meta: Meta<typeof List> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/List',
  component: List,
};

export default meta;

export function NestedList() {
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
              <ListItemButton>Subitem 1</ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton>Subitem 2</ListItemButton>
            </ListItem>
          </List>
        </ListItem>
        <ListItem nested>
          <ListSubheader>Category 2</ListSubheader>
          <List>
            <ListItem>
              <ListItemButton>Subitem 1</ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton>Subitem 2</ListItemButton>
            </ListItem>
          </List>
        </ListItem>
      </List>
    </div>
  );
}
