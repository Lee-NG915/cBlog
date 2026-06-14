import { render } from '@testing-library/react';

import CouponApplyButton from './coupon-apply-button';

describe('CouponApplyButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CouponApplyButton />);
    expect(baseElement).toBeTruthy();
  });
});
