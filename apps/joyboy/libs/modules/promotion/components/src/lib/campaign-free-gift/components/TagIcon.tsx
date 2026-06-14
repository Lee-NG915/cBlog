import { Box, Typography } from '@castlery/fortress';
import { useBreakpoints } from '@castlery/fortress';
export const TagIcon = ({
  text,
  color,
  w,
  h,
  sx,
  textSx,
  useMobile = false,
}: {
  text: string;
  color?: string;
  w?: number;
  h?: number;
  sx?: Record<string, any>;
  textSx?: Record<string, any>;
  useMobile?: boolean;
}) => {
  const { mobile } = useBreakpoints();

  const isMobile = useMobile || mobile;
  return (
    <Box
      sx={{
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        background: (theme) => color || theme.palette.brand.terracotta[500],
        width: w || (isMobile ? 42 : 46),
        height: h || (isMobile ? 25 : 29),
        ...sx,
      }}
    >
      <Typography
        level={useMobile ? 'caption2' : 'caption1'}
        sx={{
          textAlign: 'center',
          color: (theme) => theme.palette.brand.charcoal[0],
          ...textSx,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};
