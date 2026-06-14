import { render } from '@testing-library/react';

import PosProductItemControl from './pos-product-item-control';

describe('PosProductItemControl', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosProductItemControl />);
    expect(baseElement).toBeTruthy();
  });
});
