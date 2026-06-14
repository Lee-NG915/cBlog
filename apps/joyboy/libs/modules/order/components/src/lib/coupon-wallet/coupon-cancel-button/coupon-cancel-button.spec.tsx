import { render } from '@testing-library/react';

import CouponCancelButton from './coupon-cancel-button';

describe('CouponCancelButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CouponCancelButton />);
    expect(baseElement).toBeTruthy();
  });
});
