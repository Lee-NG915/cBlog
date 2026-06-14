'use client';
import { useRef } from 'react';
import { useGetOrderDetailsQuery } from '@castlery/modules-order-domain';
import { useSearchParams } from 'next/navigation';

export function PageClient() {
  const initialized = useRef(false);
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('number') as string;

  useGetOrderDetailsQuery(
    { orderNumber: orderNumber },
    { skip: !orderNumber || orderNumber === 'undefined' || orderNumber === 'null' }
  );

  if (!initialized.current) {
    initialized.current = true;
  }

  return <></>;
}
