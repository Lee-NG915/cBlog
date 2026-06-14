import { render } from '@testing-library/react';

import WebAddToCart from './web-add-to-cart';

describe('WebAddToCart', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebAddToCart />);
    expect(baseElement).toBeTruthy();
  });
});
