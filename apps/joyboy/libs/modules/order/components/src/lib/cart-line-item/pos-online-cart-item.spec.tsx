import { render } from '@testing-library/react';

import PosOnlineCartItem from './pos-online-cart-item';

describe('PosOnlineCartItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosOnlineCartItem />);
    expect(baseElement).toBeTruthy();
  });
});
