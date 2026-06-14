'use client';
import { Box, Button, Typography } from '@castlery/fortress';
export function ErrorPlaceholder({ title }: { title?: string }) {
  return (
    <Box>
      <Typography level="h2">{title}</Typography>
      <Typography level="body1" sx={{ mt: 4 }}>
        {'Oops! Something went wrong.'}
      </Typography>
    </Box>
  );
}
