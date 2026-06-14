'use client';
import { ReviewsContent } from '@castlery/modules-user-components';
import { Box } from '@castlery/fortress';
// 评价页面 - @account/reviews
export default function ReviewsPage() {
  return (
    <Box
      sx={{
        px: {
          xs: 6,
          sm: 6,
          md: 9,
        },
        py: {
          xs: 4,
          sm: 6,
          md: 8,
        },
      }}
    >
      <ReviewsContent />
    </Box>
  );
}
