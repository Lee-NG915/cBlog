import React from 'react';
import { Box, Checkbox, ListItem, List, Grid } from '@castlery/fortress';
import { NextFortressLink, formatLabel } from '@castlery/shared-components';

export interface FilterListItem {
  value: string;
  label: string;
  isChecked: boolean;
}

export interface FilterListProps {
  items: FilterListItem[];
  onItemToggle: (value: string) => void;

  // 显示更多功能
  canToggleShowMore?: boolean;
  isShowingMore?: boolean;
  onToggleShowMore?: () => void;
  showMoreText?: string;
  showLessText?: string;
  hideShowMoreBtn?: boolean;

  // SEO和可访问性
  ariaLabel?: string;
  role?: string;
}

export function FilterList({
  items,
  onItemToggle,
  canToggleShowMore = false,
  isShowingMore = false,
  onToggleShowMore,
  showMoreText = 'View more',
  showLessText = 'View less',
  hideShowMoreBtn = false,
  ariaLabel = 'Filter options',
  role = 'group',
}: FilterListProps) {
  // 统一使用Grid布局，响应式处理：移动端一行两个，桌面端一行一个
  return (
    <Box>
      <Grid container spacing={1}>
        {items.map((item) => (
          <Grid xs={6} md={12} key={item.value}>
            <List
              role={role}
              aria-label={ariaLabel}
              sx={{
                '--ListItem-paddingX': '0',
                '--ListItem-paddingY': '0.125rem',
              }}
            >
              <ListItem>
                <Checkbox
                  checked={item.isChecked}
                  onChange={() => onItemToggle(item.value)}
                  label={formatLabel(item.label)}
                  aria-label={`Filter by ${formatLabel(item.label)}`}
                  sx={{
                    pl: 2,
                    // textTransform: 'capitalize',
                  }}
                />
              </ListItem>
            </List>
          </Grid>
        ))}
      </Grid>

      {canToggleShowMore && !hideShowMoreBtn && onToggleShowMore && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
          <NextFortressLink
            component={Box}
            variant="primary"
            level="body2"
            onClick={onToggleShowMore}
            sx={{ textTransform: 'none' }}
            role="button"
            aria-expanded={isShowingMore}
            aria-label={isShowingMore ? `${showLessText} filters` : `${showMoreText} filters`}
          >
            {isShowingMore ? showLessText : showMoreText}
          </NextFortressLink>
        </Box>
      )}
    </Box>
  );
}
