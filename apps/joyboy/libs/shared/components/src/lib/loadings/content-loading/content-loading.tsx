'use client';
import { Box, CircularProgress } from '@castlery/fortress';

export interface ContentLoadingProps {
  loading: boolean;
}

export const ContentLoading = ({ loading }: ContentLoadingProps) => {
  if (!loading) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress size="lg" color="neutral" />
    </Box>
  );
};

// export type ContentLoadingProps = Parameters<typeof ContentLoading>[0];

export default ContentLoading;
