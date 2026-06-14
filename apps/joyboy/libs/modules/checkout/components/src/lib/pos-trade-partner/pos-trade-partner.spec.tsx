import { render } from '@testing-library/react';

import PosTradePartner from './pos-trade-partner';

describe('PosTradePartner', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosTradePartner />);
    expect(baseElement).toBeTruthy();
  });
});
