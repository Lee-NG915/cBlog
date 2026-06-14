'use client';
import {
  Box,
  Dropdown,
  type DropdownProps,
  Stack,
  SxProps,
  Typography,
  type TypographyProps,
} from '@castlery/fortress';
import { ExpandMore } from '@castlery/fortress/Icons';
import { useRef, useState } from 'react';

export interface SortOption {
  value: string;
  label: string;
  [property: string]: string;
}

export interface SortByProps {
  /** Current selected sort value */
  value: string;
  /** Available sort options */
  options: SortOption[];
  /** Callback when sort value changes */
  onChange: (value: string) => void;
  /** Custom label defaults to "Sort By" */
  label?: string;
  /** Additional CSS classes or styles */
  className?: string;
  /** Additional styles */
  sx?: SxProps;
  dropdownProps?: DropdownProps;
  labelProps?: TypographyProps;
}

export function SortBy({
  value,
  options,
  onChange,
  label = 'Sort By',
  className,
  sx,
  dropdownProps = {
    variant: 'borderplain',
  },
  labelProps,
}: SortByProps) {
  const [listboxOpen, setListboxOpen] = useState(false);
  const skipRef = useRef(false);

  const handleChange = (event: React.SyntheticEvent | null, newValue: string | null) => {
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center" className={className} sx={sx}>
      {/* Mobile: Only show label text, clickable to control select */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0 }}>
        <Typography
          role="button"
          level="subh2"
          color="primary"
          onMouseDown={() => {
            skipRef.current = true;
          }}
          onClick={() => {
            skipRef.current = false;
            setListboxOpen((bool) => !bool);
          }}
          sx={{
            cursor: 'pointer',
          }}
          tabIndex={0}
          endDecorator={
            <Box
              sx={{
                transition: 'transform 0.2s ease-in-out',
                transform: listboxOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ExpandMore />
            </Box>
          }
          {...labelProps}
        >
          {label}
        </Typography>
        <Dropdown
          value={value}
          onChange={handleChange}
          size="md"
          listboxOpen={listboxOpen}
          onListboxOpenChange={(isOpen) => {
            if (!skipRef.current) {
              setListboxOpen(isOpen);
            }
          }}
          slotProps={{
            root: {
              sx: {
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none',
                width: 0,
                height: 0,
                overflow: 'hidden',
              },
            },
            button: {
              sx: (theme) => ({
                ...theme.typography.subh2,
                display: 'none',
              }),
            },
            listbox: {
              sx: (theme) => ({
                li: {
                  ...theme.typography.subh2,
                },
              }),
            },
            indicator: {
              sx: {
                display: 'none',
              },
            },
          }}
          {...dropdownProps}
        >
          {options.map((option) => (
            <Dropdown.Option key={option.value} value={option.value}>
              {option.label}
            </Dropdown.Option>
          ))}
        </Dropdown>
      </Box>

      {/* Desktop: Show label + current selection */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
        <Typography level="subh2" color="primary" {...labelProps}>
          {`${label}:`}
        </Typography>
        <Dropdown
          size="md"
          value={value}
          onChange={handleChange}
          sx={{
            pr: 0,
          }}
          slotProps={{
            root: {
              sx: {
                borderBottom: 'none',
                '&:hover': {
                  borderBottom: 'none',
                },
                py: 3,
                px: 0,
              },
            },
            button: {
              sx: (theme) => ({
                ...theme.typography.subh2,
              }),
            },
            listbox: {
              sx: (theme) => ({
                li: {
                  ...theme.typography.subh2,
                },
              }),
            },
            indicator: {
              // 这里特殊处理是 当我给这个sortBy组件贴边处理时
              // 因为下面默认的参数会形成负margin 导致我贴边时 会多出一段距离
              sx: {
                '--Select-paddingInline': 0,
                '--Select-gap': 0,
                ml: 1,
              },
            },
          }}
          {...dropdownProps}
        >
          {options.map((option) => (
            <Dropdown.Option key={option.value} value={option.value}>
              {option.label}
            </Dropdown.Option>
          ))}
        </Dropdown>
      </Box>
    </Stack>
  );
}

export default SortBy;
