import { Loading, Stack } from '@castlery/fortress';

export const ProductReviewsLoading = () => {
  return (
    <Stack justifyContent={'center'} alignItems={'center'}>
      <Loading theme="dark" />
    </Stack>
  );
};
