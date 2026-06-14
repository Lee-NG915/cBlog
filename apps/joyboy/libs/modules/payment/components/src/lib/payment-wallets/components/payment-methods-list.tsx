import { ReactNode, memo, useCallback } from 'react';
import { Box, RadioGroup } from '@castlery/fortress';
import { PaymentMethodDisplayConfig } from '../types';
import { PaymentMethodItem } from './payment-method-item';

export interface PaymentMethodsListProps {
  methods: PaymentMethodDisplayConfig[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onMethodClick?: (key: string) => void;
  /**
   * Render prop — the container layer injects SDK-specific expanded content
   * (e.g. StripePaymentElement) for the selected method row.
   * Returning null/undefined renders nothing.
   */
  renderExpandedContent?: (methodKey: string) => ReactNode;
  /**
   * When true, all rows use flex-start alignment to accommodate the expanded Stripe form.
   */
  isExpandedLayout?: boolean;
}

function PaymentMethodsListInner({
  methods,
  selectedKey,
  onSelect,
  onMethodClick,
  renderExpandedContent,
  isExpandedLayout = false,
}: PaymentMethodsListProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSelect(e.target.value);
    },
    [onSelect]
  );

  return (
    <RadioGroup
      value={selectedKey || ''}
      onChange={handleChange}
      sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}
    >
      {methods.map((method) => (
        <Box key={method.key}>
          <PaymentMethodItem
            methodKey={method.key}
            label={method.label}
            icons={method.icons}
            isSelected={selectedKey === method.key}
            isExpandedLayout={isExpandedLayout}
            instructionText={method.instructionText}
            onClick={() => onMethodClick?.(method.key)}
          >
            {renderExpandedContent?.(method.key)}
          </PaymentMethodItem>
        </Box>
      ))}
    </RadioGroup>
  );
}

export const PaymentMethodsList = memo(PaymentMethodsListInner);
