import { render } from '@testing-library/react';

import PosCheckoutButton from './pos-checkout-button';

describe('PosCheckoutButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosCheckoutButton />);
    expect(baseElement).toBeTruthy();
  });
});
