import { render } from '@testing-library/react';

import { PosProductItem } from './pos-product-item';

describe('PosProductItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosProductItem />);
    expect(baseElement).toBeTruthy();
  });
});
