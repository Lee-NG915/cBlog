import { render } from '@testing-library/react';
import { PosCart } from './pos-cart';

describe('PosCart', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosCart />);
    expect(baseElement).toBeTruthy();
  });
});
