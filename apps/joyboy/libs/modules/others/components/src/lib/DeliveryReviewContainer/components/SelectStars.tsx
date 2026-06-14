'use client';

import { useEffect, useState } from 'react';
import { StarFilled } from '@castlery/fortress/Icons';
import { Stack, useBreakpoints } from '@castlery/fortress';
import { Star } from '@castlery/fortress/Icons';

const SelectStars = ({ onSelectChange }: { onSelectChange: (selected: number) => void }) => {
  const count = 5;
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(-1);

  const { desktop } = useBreakpoints();

  useEffect(() => {
    onSelectChange(selected);
  }, [selected]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const containerWidth = rect.width;
    const percentage = (mouseX / containerWidth) * 100;

    const starsToFill = Math.ceil((percentage / 100) * count);
    setHovered(starsToFill - 1);
  };

  const handleMouseLeave = () => {
    setHovered(-1);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (desktop) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const containerWidth = rect.width;
      const percentage = (mouseX / containerWidth) * 100;

      // 根据点击位置计算选中的星星数量
      const starsToSelect = Math.ceil((percentage / 100) * count);
      setSelected(starsToSelect);
    }
  };

  const handleClickOnMobile = (index: number) => {
    setSelected(index + 1);
  };

  const renderStars = () => {
    return [...Array(count)].map((_, i) => {
      // 判断是否应该显示实心星星：已选中的星星 OR 当前悬停的星星
      const shouldShowFilled = i < selected || (hovered !== -1 && i <= hovered);
      const StarComponent = shouldShowFilled ? StarFilled : Star;

      return (
        <StarComponent
          key={i}
          sx={(theme) => ({
            width: theme.spacing(8),
            height: theme.spacing(8),
            color: theme.palette.brand.terracotta[500],
          })}
        />
      );
    });
  };

  const renderStarsOnMobile = () => {
    return [...Array(count)].map((_, i) => {
      const shouldShowFilled = i < selected;
      const StarComponent = shouldShowFilled ? StarFilled : Star;

      return (
        <StarComponent
          key={i}
          onClick={() => handleClickOnMobile(i)}
          sx={(theme) => ({
            width: theme.spacing(8),
            height: theme.spacing(8),
            color: theme.palette.brand.terracotta[500],
          })}
        />
      );
    });
  };

  if (!desktop) {
    return (
      <Stack flexDirection="row" gap={2}>
        {renderStarsOnMobile()}
      </Stack>
    );
  }

  return (
    <Stack
      flexDirection="row"
      gap={2}
      sx={{ cursor: 'pointer' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {renderStars()}
    </Stack>
  );
};

export { SelectStars };
