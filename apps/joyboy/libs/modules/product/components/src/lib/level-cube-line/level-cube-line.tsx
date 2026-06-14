import { Box, Stack } from '@castlery/fortress';

export interface LevelCubeProps {
  highLight?: boolean;
}
export function LevelCube(props: LevelCubeProps) {
  const { highLight } = props;
  return (
    <Box
      sx={{
        width: '20px',
        height: '8px',
        margin: '0 2px',
        backgroundColor: (theme) =>
          highLight ? theme.palette.brand.terracotta[500] : theme.palette.brand.charcoal[300],
      }}
    ></Box>
  );
}

/* eslint-disable-next-line */
export interface LevelCubeLineProps {
  ratingCapacity: number;
  currentRating: number;
}

export function LevelCubeLine(props: LevelCubeLineProps) {
  const { ratingCapacity, currentRating } = props;
  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {Array.from({ length: ratingCapacity }, (_, index) => {
        if (index === currentRating - 1) {
          return <LevelCube key={index} highLight />;
        }
        return <LevelCube key={index} />;
      })}
    </Stack>
  );
}

export default LevelCubeLine;
