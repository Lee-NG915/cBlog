'use client';
import { Stack, CircularProgress } from '@castlery/fortress';

export interface BackdropLoadingProps {
  loading: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** CSS backdrop-filter blur value, e.g. '4px'. When provided, replaces the default semi-transparent background. */
  blur?: string;
}

export const BackdropLoading = ({ loading, size = 'lg', blur }: BackdropLoadingProps) => {
  if (!loading) return null;
  return (
    <Stack
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: blur ? 'rgba(246, 243, 231, 0.4)' : 'rgba(246, 243, 231, .15)',
        backdropFilter: blur ? `blur(${blur})` : undefined,
        zIndex: 2,
      }}
    >
      <CircularProgress
        size={size}
        color="neutral"
        variant="soft"
        sx={{
          '--CircularProgress-size': size === 'lg' ? '40px' : undefined, // 调大 lg 的实际像素
        }}
      />
    </Stack>
  );
};

// export type BackdropLoadingProps = Parameters<typeof BackdropLoading>[0];

export default BackdropLoading;
