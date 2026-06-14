'use client';

import { Stack, Link } from '@castlery/fortress';
import { CalendarEdit } from '@castlery/fortress/Icons';

export interface PreferredDeliveryDateProps {
  buttonText: string;
  endDecorator?: React.ReactNode;
}

export const PreferredDeliveryDate = ({ buttonText, endDecorator }: PreferredDeliveryDateProps) => {
  return (
    <Stack>
      <Link level="caption2" component="button" onClick={() => {}} endDecorator={endDecorator || <CalendarEdit />}>
        {buttonText}
      </Link>
    </Stack>
  );
};

export default PreferredDeliveryDate;
