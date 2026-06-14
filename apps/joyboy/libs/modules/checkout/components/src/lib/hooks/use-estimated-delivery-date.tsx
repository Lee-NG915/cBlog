'use client';
import { useMemo } from 'react';
import { EcEnv } from '@castlery/config';
import { OrderDataV1 } from '@castlery/types';
import { addSomeDays, formatDate, getDate, isAfterDate, isValidDate } from '@castlery/utils';

const isProdEnv = !!EcEnv.NEXT_PUBLIC_APPLICATION_ENV?.includes('prod');

/**
 * Estimated delivery date is the latest `promisedDeliveryEndDate` across all
 * shipments, padded by 6 days. Non-prod envs always return tomorrow so QA can
 * exercise the downstream UI without seeding realistic shipment dates.
 */
export const useEstimatedDeliveryDate = (order: OrderDataV1 | undefined): string | null =>
  useMemo(() => {
    if (!isProdEnv) {
      return formatDate(addSomeDays(new Date(), 1), 'yyyy-MM-dd') || null;
    }

    if (!order?.shipments?.length) return null;

    const maxDate = order.shipments.reduce<Date | null>((latest, shipment) => {
      const candidate = shipment.promisedDeliveryEndDate;
      if (!isValidDate(candidate)) return latest;

      const candidateDate = getDate(candidate);
      if (!latest || isAfterDate(candidateDate, latest)) return candidateDate;
      return latest;
    }, null);

    return maxDate ? formatDate(addSomeDays(maxDate, 6), 'yyyy-MM-dd') || null : null;
  }, [order?.shipments]);
