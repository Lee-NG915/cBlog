import { render } from '@testing-library/react';

import CouponRowItem from './coupon-row-item';

describe('CouponRowItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CouponRowItem />);
    expect(baseElement).toBeTruthy();
  });
});
