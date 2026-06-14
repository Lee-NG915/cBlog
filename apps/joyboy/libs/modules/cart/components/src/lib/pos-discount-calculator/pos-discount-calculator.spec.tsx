import { render } from '@testing-library/react';

import PosDiscountCalculator from './pos-discount-calculator';

describe('PosDiscountCalculator', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosDiscountCalculator />);
    expect(baseElement).toBeTruthy();
  });
});

