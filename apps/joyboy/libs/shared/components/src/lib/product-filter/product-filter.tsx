/* eslint-disable @nx/enforce-module-boundaries */
import React from 'react';
import { Typography, Stack, Chip, Box, SxProps } from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';
import { splitLabel } from '../format-label';

export interface FilterItem {
  /** 筛选器的标识符 */
  id: string;
  /** 筛选器分类标签 */
  label: string;
  /** 筛选器的具体选项 */
  refinements: FilterRefinement[];
}

export interface FilterRefinement {
  /** 筛选选项的标识符 */
  id: string;
  /** 筛选选项的显示文本 */
  label: string;
  /** 任意额外数据 */
  value?: SxProps;
}

export interface ProductFilterProps {
  /** 当前激活的筛选条件列表 */
  items: FilterItem[];
  /** 移除筛选条件的回调函数 */
  onRemoveRefinement: (refinement: FilterRefinement) => void;
  /** 自定义样式 */
  sx?: SxProps;
  /** 自定义类名 */
  className?: string;
}

export function ProductFilter({ items, onRemoveRefinement, sx, className }: ProductFilterProps) {
  if (items.length === 0) return null;

  return (
    <Stack
      direction="row"
      gap={{
        xs: 2,
        md: 4,
      }}
      sx={{
        display: 'contents',
        ...sx,
      }}
      className={className}
    >
      {items.map((item) => (
        <Chip
          key={item.id + item.label}
          variant="outlined"
          color="neutral"
          size="lg"
          sx={{
            borderColor: 'var(--fortress-palette-brand-terracotta-500)',
            px: 2,
            py: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Typography
              level="caption1"
              color="primary"
              sx={{
                fontWeight: 700,
                // 关闭这个 不然好导致 Length (cm) 变成 Length (Cm)
                // textTransform: 'capitalize',
              }}
            >
              {`${item.label}:`}
            </Typography>
            {item.refinements.map((refinement) => (
              <Chip
                variant="plain"
                key={refinement.id}
                onClick={(event) => {
                  if (isModifierClick(event)) {
                    return;
                  }
                  onRemoveRefinement(refinement);
                }}
                endDecorator={<Close color="primary" />}
                sx={{
                  cursor: 'pointer',
                }}
              >
                <Typography level="caption1" color="primary">
                  {splitLabel(refinement.label)}
                </Typography>
              </Chip>
            ))}
          </Box>
        </Chip>
      ))}
    </Stack>
  );
}
// https://www.algolia.com/doc/api-reference/widgets/current-refinements/react/?client=ts
function isModifierClick(event: React.MouseEvent) {
  const isMiddleClick = event.button === 1;

  return Boolean(isMiddleClick || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
}
