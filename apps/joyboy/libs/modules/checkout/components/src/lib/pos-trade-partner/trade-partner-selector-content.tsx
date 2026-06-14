import React, { useCallback } from 'react';
import { Autocomplete } from '@castlery/fortress';

export interface Option {
  label: string;
  id: string;
}
export interface TradePartnerSelectorContentProps {
  tradePartners: Option[];
  partnerChange: (id: string) => void;
}
export function TradePartnerSelectorContent({ tradePartners, partnerChange }: TradePartnerSelectorContentProps) {
  const onChange = useCallback(
    (event: React.SyntheticEvent, value: Option | null, reason: string, details?: any) => {
      const id = value?.id || '';
      partnerChange && partnerChange(id);
    },
    [partnerChange]
  );
  return (
    <Autocomplete
      placeholder="search for a trade partner..."
      options={tradePartners}
      getOptionKey={(option) => option.id}
      getOptionLabel={(option) => option.label}
      onChange={onChange}
    />
  );
}

export default TradePartnerSelectorContent;
