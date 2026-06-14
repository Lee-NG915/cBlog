import { render } from '@testing-library/react';

import PosExchangeOrder from './pos-exchange-order';

describe('PosExchangeOrder', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosExchangeOrder />);
    expect(baseElement).toBeTruthy();
  });
});
