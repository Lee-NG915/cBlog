import { render } from '@testing-library/react';

import CouponTooltip from './coupon-tooltip';

describe('CouponTooltip', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CouponTooltip />);
    expect(baseElement).toBeTruthy();
  });
});
