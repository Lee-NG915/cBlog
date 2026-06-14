import { Button, Stack, Box } from '@castlery/fortress';
import { FilterAlt } from '@castlery/fortress/Icons';
import { CustomSortBy } from '../instantsearch/custom-sort-by';
import { CustomCurrentRefinements } from '../instantsearch/custom-current-refinements';
import { CustomClearRefinements } from '../instantsearch/custom-clear-refinements';
import { SortOption } from '../config/sort-options.config';
import { EcEnv } from '@castlery/config';
import { NextFortressLink } from '@castlery/shared-components';

interface DesktopFilterControlsProps {
  onFilterClick: () => void;
  sortOptions?: SortOption[];
  showFilters: boolean;
}

export function DesktopFilterControls({ onFilterClick, sortOptions, showFilters }: DesktopFilterControlsProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      // 使左右两侧在多行情况下按顶部对齐，避免右侧排序控件垂直居中
      alignItems="flex-start"
      justifyContent="space-between"
      sx={{
        display: { xs: 'none', md: 'flex' },
        pt: EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' ? 0 : 6,
        pb: EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' ? 0 : 3,
        width: '100%',
        gap: 2,
      }}
    >
      {/* 左侧：筛选按钮 + 当前筛选项（可换行）
          布局要点：
          - 使用一个可换行的行内flex容器，按钮在最前，后面紧跟chips；
          - flex:1 + minWidth:0 允许此区域占满剩余空间，并且在溢出时正确换行；
          - ProductFilter 内部使用 display: 'contents'，使各个Chip直接参与到本容器的流中。 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: 4,
          rowGap: 2,

          flex: 1,
          minWidth: 0,
        }}
      >
        {/* 筛选开关按钮固定宽度，不参与收缩，避免被压缩 */}
        <NextFortressLink
          variant="tertiary"
          color="neutral"
          level="subh2"
          sx={{ py: 3, px: 0, flexShrink: 0, textDecoration: 'none' }}
          startDecorator={
            <FilterAlt
              sx={{
                ml: '-6px',
              }}
            />
          }
          component={'button'}
          onClick={onFilterClick}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </NextFortressLink>

        {/* 当前筛选项与重置按钮：与按钮同一行开始，空间不足时仅chips换行 */}
        <CustomCurrentRefinements />
        <CustomClearRefinements />
      </Box>

      {/* 右侧：排序控件
          - flexShrink:0 保持其尺寸稳定；
          - alignSelf:'flex-start' 使其与左侧第一行顶部对齐。 */}
      <Box sx={{ flexShrink: 0, alignSelf: 'flex-start' }}>
        <CustomSortBy items={sortOptions || []} />
      </Box>
    </Stack>
  );
}
