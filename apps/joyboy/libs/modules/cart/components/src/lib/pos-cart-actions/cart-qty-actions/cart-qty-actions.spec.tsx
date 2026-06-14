import { render } from '@testing-library/react';

import CartQtyActions from './cart-qty-actions';

describe('CartQtyActions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CartQtyActions />);
    expect(baseElement).toBeTruthy();
  });
});
