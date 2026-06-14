'use client';
import { Chip } from '@castlery/fortress';
import { stockOutDatedText, priceOutDatedText } from './config';
import { InfoThin } from '@castlery/fortress/Icons';

export function OutDatedNotice({ isPriceOutdated }: { isPriceOutdated: boolean }) {
  const outDatedText = isPriceOutdated ? priceOutDatedText : stockOutDatedText;
  return (
    <Chip
      variant="outlined"
      color="primary"
      sx={{ height: 'auto !important', textAlign: 'left', gap: 0.5 }}
      startDecorator={<InfoThin sx={{ width: 12, height: 12 }} />}
    >
      {outDatedText}
    </Chip>
  );
}

export default OutDatedNotice;
