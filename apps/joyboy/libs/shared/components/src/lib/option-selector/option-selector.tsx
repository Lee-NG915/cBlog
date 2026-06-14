'use client';
import { IconButton, Typography, Box, Stack } from '@castlery/fortress';
import { FortressImage } from '../fortress-image/fortress-image';
import React from 'react';
import { EcEnv } from '@castlery/config';

export interface OptionItem {
  id: string;
  value: string;
  label: string;
  image?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
}

export interface OptionSelectorProps {
  /** Option items to display */
  options: OptionItem[];
  /** Maximum number of options to display before showing "+X more" */
  maxDisplay?: number;
  /** Total options count (used for calculating additional count) */
  totalOptionsCount?: number;
  /** Size of the option buttons */
  size?: number;
  /** Whether to show additional count text */
  showAdditionalCount?: boolean;
  /** Callback when an option is selected */
  onSelect: (optionId: string) => void;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  sx?: any;
  /** Whether to allow wrapping to multiple lines (default: true) */
  allowWrap?: boolean;
  /** Whether to show the option selector on the product page */
  isProductPage?: boolean;
  /** Whether to show the tooltip */
  isNeedTooltip?: boolean;
  /** Tooltip wrapper component */
  TooltipContent?: React.ComponentType<{
    children: React.ReactElement;
    id?: string;
    src?: string;
    value: string;
  }>;
  /** Shape variant: 'circle' for circular buttons, 'square' for square buttons */
  variant?: 'circle' | 'square';
}

export function OptionSelector({
  options,
  maxDisplay = 3,
  totalOptionsCount,
  size = 32,
  showAdditionalCount = true,
  onSelect,
  className,
  sx,
  allowWrap = true,
  isProductPage = false,
  isNeedTooltip = false,
  TooltipContent,
  variant = 'circle',
}: OptionSelectorProps) {
  if (options.length <= 1 && !isProductPage) {
    return null;
  }

  const displayOptions = options.slice(0, maxDisplay);
  const totalCount = totalOptionsCount || options.length;
  const additionalCount = Math.max(0, totalCount - maxDisplay);
  const borderRadius = variant === 'square' ? 0 : '50%';
  const borderWidth = variant === 'square' ? '1px' : '2px';
  const borderColor =
    variant === 'square' ? 'var(--fortress-palette-brand-maroonVelvet-500)' : 'var(--fortress-palette-brand-mono-600)';

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        // 响应式间距，移动端更紧凑
        gap: EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' ? 1 : { xs: 1.5, sm: 2, md: 2.5 },
        // 添加换行支持以防止水平溢出
        flexWrap: allowWrap ? 'wrap' : 'nowrap',
        // 确保不会溢出容器
        maxWidth: '100%',
        overflow: allowWrap ? 'visible' : 'hidden',
        ...sx,
      }}
      className={className}
    >
      {displayOptions.map((option) => {
        const isSelected = option.isSelected || false;
        const isDisabled = option.isDisabled || false;
        const iconButton = (
          <IconButton
            onClick={() => {
              if (!isDisabled) {
                onSelect(option.id);
              }
            }}
            disabled={isDisabled}
            variant="plain"
            size="sm"
            sx={{
              borderRadius: borderRadius,
              overflow: 'visible',
              border: isSelected ? `${borderWidth} solid ${borderColor}` : `${borderWidth} solid transparent`,
              p: '2px',
              position: 'relative',
              backgroundColor: 'transparent',
              // 确保按钮不会收缩过小
              flexShrink: 0,
              minWidth: { xs: size, sm: size },
              minHeight: { xs: size, sm: size },
              // Disabled 状态样式
              ...(isDisabled && {
                opacity: 0.6,
                cursor: 'not-allowed',
                filter: 'grayscale(50%)',
              }),
              '&:hover': {
                backgroundColor: 'transparent',
                border: isSelected ? `${borderWidth} solid ${borderColor}` : `${borderWidth} solid transparent`,
              },
              '&:active': {
                backgroundColor: 'transparent',
              },
              '&:focus': {
                backgroundColor: 'transparent',
              },
            }}
            aria-label={`Select ${option.label}`}
            aria-disabled={isDisabled}
            title={option.label}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: borderRadius,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {option.image ? (
                <FortressImage
                  src={option.image}
                  alt={option.value}
                  ratio={1}
                  sx={{
                    width: size,
                    height: size,
                    borderRadius: borderRadius,
                    objectFit: 'cover',
                  }}
                  sizes={size + 'px'}
                />
              ) : (
                <Typography level="caption2">{option.value?.charAt(0).toUpperCase()}</Typography>
              )}
              {isDisabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: borderRadius,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    zIndex: 1,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '2px',
                      height: '150%',
                      backgroundColor: 'var(--fortress-palette-brand-mono-600)',
                      transform: 'translate(-50%, -50%) rotate(-45deg)',
                      transformOrigin: 'center',
                    },
                  }}
                />
              )}
            </Box>
          </IconButton>
        );

        if (isNeedTooltip && TooltipContent) {
          return (
            <TooltipContent key={option.id} id={option.id} src={option.image} value={option.value}>
              {iconButton}
            </TooltipContent>
          );
        }

        return <React.Fragment key={option.id}>{iconButton}</React.Fragment>;
      })}

      {showAdditionalCount && additionalCount > 0 && (
        <Typography
          level="body1"
          sx={{
            color: 'var(--fortress-palette-brand-maroonVelvet-500)',
            flexShrink: 0,
          }}
        >
          +{additionalCount}
        </Typography>
      )}
    </Stack>
  );
}
