'use client';
import { List, ListItem, Typography } from '@castlery/fortress';
import { memo, useMemo } from 'react';

export interface ItemsListProps {
  items: {
    lineItemId: string;
    name: string;
    variantId: number;
  }[];
}

export const ItemsList = memo(({ items }: ItemsListProps) => {
  // Filter out items without product names (handles deleted products from backend)
  const filteredItems = useMemo(() => {
    return items.filter((item) => item?.name?.trim());
  }, [items]);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <List sx={{ padding: 0, gap: 0 }}>
      {filteredItems.map((item) => (
        <ListItem key={item.lineItemId} sx={{ padding: 0, height: 'auto', justifyContent: 'center' }}>
          <Typography
            level="caption1"
            sx={{ color: (theme) => theme.palette.brand.mono[700] }}
            startDecorator={<BulletPoint />}
          >
            {item.name}
          </Typography>
        </ListItem>
      ))}
    </List>
  );
});

ItemsList.displayName = 'ItemsList';

const BulletPoint = () => (
  <Typography level="body2" sx={{ color: (theme) => theme.palette.brand.mono[700] }}>
    ·
  </Typography>
);
