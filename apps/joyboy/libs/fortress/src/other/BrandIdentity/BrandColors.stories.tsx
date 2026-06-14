import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Grid, Stack, Typography, Divider, Sheet } from '@mui/joy';
import { paletteV2 } from '../../Theme/v2/colors';

type BrandColorKey = keyof typeof paletteV2;

const BRAND_COLOR_GROUPS: Array<{
  title: string;
  description?: string;
  colors: BrandColorKey[];
}> = [
  {
    title: 'Primary palette',
    description: `Terracotta 500 is the primary color that define Castlery's brand identity. It serve as a foundation for creating visual hierarchy, establishing brand recognition, and maintaining a cohesive user experience. `,
    colors: ['terracotta', 'maroonVelvet', 'burntOrange'],
  },
  {
    title: 'Secondary palette',
    description:
      'These colours give us access to an extended spectrum of combinations that we can use to add dimensionality to our designs, and curate the right colour pairings for each moment. Burnt Orange 500 and Freshwater Blue 500 are mainly used as primary call-to-actions but can occasionally be used as a background when the whole design needs to stand out.',
    colors: ['freshWaterBlue', 'leafGreen'],
  },
  {
    title: 'Extended brand palette',
    description:
      'The extended palette consists of all the useable tints and shades of each color in the palette. They are all numbered for easy reference. Usage of these colors varies depending on the touch point, but they come in handy for illustrations and components in product.',
    colors: ['terracotta', 'maroonVelvet', 'burntOrange', 'freshWaterBlue', 'leafGreen'],
  },
];

type ShadeTuple = [string, string];

const getShades = (colorKey: BrandColorKey): ShadeTuple[] => {
  const value = paletteV2[colorKey];
  if (typeof value === 'string') {
    return [];
  }

  return Object.entries(value)
    .filter(([level]) => /^\d+$/.test(level))
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([level, hex]) => [level, String(hex)]);
};

const getPrimarySwatch = (colorKey: BrandColorKey) => {
  const value = paletteV2[colorKey];

  if (typeof value === 'string') {
    return value;
  }

  return value['500'];
};

const ensureArray = <T,>(items: T[] | readonly T[]) => [...items];

const formatColorName = (colorKey: BrandColorKey) =>
  colorKey.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());

const ColorSwatch: React.FC<{ colorKey: BrandColorKey }> = ({ colorKey }) => {
  const shades = getShades(colorKey);
  const primary = getPrimarySwatch(colorKey);
  const mainChannel =
    typeof paletteV2[colorKey] === 'string' ? undefined : (paletteV2[colorKey] as { mainChannel?: string }).mainChannel;

  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: 'xl',
        overflow: 'hidden',
        bgcolor: 'background.surface',
        boxShadow: 'sm',
      }}
    >
      <Box
        sx={{
          bgcolor: primary,
          height: 160,
        }}
      />
      <Stack spacing={3} sx={{ px: 4, py: 4 }}>
        <Stack spacing={1}>
          <Typography level="body3" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1.1 }}>
            {formatColorName(colorKey)}
          </Typography>
          <Typography level="h3">{primary.toUpperCase()}</Typography>
          {mainChannel && (
            <Typography level="body2" sx={{ opacity: 0.72 }}>
              RGB {mainChannel}
            </Typography>
          )}
        </Stack>
      </Stack>
      <Divider />
      <Stack spacing={2.5} sx={{ px: 4, py: 4 }}>
        <Grid container spacing={2}>
          <Grid xs={6}>
            <Typography level="body3" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Hex
            </Typography>
            <Typography level="body2">{primary.toUpperCase()}</Typography>
          </Grid>
          <Grid xs={6}>
            <Typography level="body3" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Name
            </Typography>
            <Typography level="body2">{formatColorName(colorKey)}</Typography>
          </Grid>
        </Grid>
        {shades.length > 0 && (
          <Stack spacing={1.5}>
            <Typography level="body3" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Shades
            </Typography>
            <Stack spacing={1} direction="row" flexWrap="wrap" useFlexGap>
              {ensureArray(shades).map(([level, hex]) => (
                <Stack
                  key={`${colorKey}-${level}`}
                  spacing={0.75}
                  sx={{
                    minWidth: 96,
                    flexBasis: { xs: '48%', sm: '30%' },
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: 'sm',
                      height: 48,
                      bgcolor: hex,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Typography level="body3" fontWeight="lg">
                    {level}
                  </Typography>
                  <Typography level="body3" sx={{ opacity: 0.8 }}>
                    {hex.toUpperCase()}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Sheet>
  );
};

const BrandColorsContent: React.FC = () => (
  <Stack
    spacing={8}
    sx={{
      p: { xs: 3, md: 8 },
      gap: 8,
    }}
  >
    <Stack spacing={2}>
      <Typography level="h1">Brand Colours</Typography>
      <Typography level="body2">
        Provides a cohesive and recognisable colour scheme that sets the tone for Fortress, maintains a consistent
        visual identity, improves recognition, and enhances user experience by creating a sense of familiarity and brand
        cohesion.
      </Typography>
    </Stack>
    {BRAND_COLOR_GROUPS.map((group) => (
      <React.Fragment key={group.title}>
        <Stack spacing={3.5}>
          <Stack sx={{ maxWidth: 780 }}>
            <Typography level="h2">{group.title}</Typography>
            {group.description && <Typography level="body2">{group.description}</Typography>}
          </Stack>
          <Box>
            {group.colors.map((color) => (
              <Box key={color}>
                <ColorSwatch colorKey={color} />
              </Box>
            ))}
          </Box>
        </Stack>
        <Divider />
      </React.Fragment>
    ))}
  </Stack>
);

const meta = {
  title: 'Brand Identity/Brand Colors',
  parameters: {
    layout: 'fullscreen',
    options: {
      showPanel: false,
    },
    docs: {
      page: () => <BrandColorsContent />,
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Overview: Story = {
  parameters: {
    docsOnly: true,
  },
  render: () => <BrandColorsContent />,
};
