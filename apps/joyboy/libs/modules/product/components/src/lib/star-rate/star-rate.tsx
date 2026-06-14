import { StarFilled } from '@castlery/fortress/Icons';
import { Stack } from '@castlery/fortress';

export interface StarRateProps {
  count: number;
}
export function StarRate({ count }: StarRateProps) {
  return (
    <Stack direction={'row'} alignItems={'center'}>
      {[...Array(count)].map((_, i) => {
        return <StarFilled key={i} color="primary" sx={{ fontSize: 24 }} />;
      })}
    </Stack>
  );
}

export default StarRate;
