import { render } from '@testing-library/react';

import CartQtyButton from './cart-qty-button';

describe('CartQtyButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CartQtyButton />);
    expect(baseElement).toBeTruthy();
  });
});
