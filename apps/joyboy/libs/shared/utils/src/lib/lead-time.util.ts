import { getDate, formatDate } from './time.util';

interface DeliveryTimeParams {
  startDeliveryTime?: string;
  endDeliveryTime?: string;
  startDispatchTime?: string;
  endDispatchTime?: string;
  showPrefix?: boolean;
}

/**
 * Helper function to format date range with appropriate year display
 */
const formatDateRange = (startTime: string, endTime: string): string => {
  const now = getDate();
  const startDate = getDate(startTime);
  const endDate = getDate(endTime);

  // Show year if any date is in a different year from current or from each other
  const shouldShowYear =
    now.getFullYear() !== startDate.getFullYear() || startDate.getFullYear() !== endDate.getFullYear();
  const dateFormat = shouldShowYear ? 'MMM d, yyyy' : 'MMM d';

  // Use original UTC strings directly to avoid double timezone conversion
  return `${formatDate(startTime, dateFormat)} - ${formatDate(endTime, dateFormat)}`;
};

export const getDeliveryTimePresentation = ({
  startDeliveryTime,
  endDeliveryTime,
  startDispatchTime,
  endDispatchTime,
  showPrefix = true,
}: DeliveryTimeParams): string => {
  const prefixLabel = 'Estimated';
  if (startDeliveryTime && endDeliveryTime) {
    const prefix = showPrefix ? `${prefixLabel} delivery within` : '';
    return `${prefix} ${formatDateRange(startDeliveryTime, endDeliveryTime)}`;
  }

  if (startDispatchTime && endDispatchTime) {
    const prefix = showPrefix ? `${prefixLabel} dispatch within` : '';
    return `${prefix} ${formatDateRange(startDispatchTime, endDispatchTime)}`;
  }

  return '';
};
