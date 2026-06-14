'use client';

import { Stack, Typography, Box } from '@castlery/fortress';

interface QuickFilterOption {
  key: string;
  label: string;
  selected: boolean;
}

interface QuickFilterProps {
  options: QuickFilterOption[];
  onSelect: (key: string) => void;
}

const QuickFilter = ({ options, onSelect }: QuickFilterProps) => {
  return (
    <Stack>
      <Typography level="body2" sx={(theme) => ({ mb: theme.spacing(3) })}>
        Top mentions
      </Typography>
      <Stack
        sx={(theme) => ({
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing(3),
          alignItems: 'center',
        })}
      >
        {options.map((option) => (
          <Box
            key={option.key}
            sx={(theme) => ({
              border: '1px solid var(--fortress-palette-brand-mono-300)',
              padding: `${theme.spacing(1.5)} ${theme.spacing(3)}`,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: theme.palette.brand.terracotta[100],
              },
              ...(option.selected && {
                backgroundColor: theme.palette.brand.terracotta[500],
                borderColor: theme.palette.brand.terracotta[500],
                '&:hover': {
                  backgroundColor: theme.palette.brand.terracotta[100],
                  border: '1px solid var(--fortress-palette-brand-mono-300)',
                },
              }),
            })}
            onClick={() => onSelect(option.key)}
          >
            <Typography
              level="caption1"
              sx={(theme) => ({
                color: theme.palette.brand.mono[900],
                ...(option.selected && {
                  color: theme.palette.brand.warmLinen[500],
                  '&:hover': {
                    color: `${theme.palette.brand.mono[900]} !important`,
                  },
                }),
              })}
            >
              {option.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};

export { QuickFilter };
