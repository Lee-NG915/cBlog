import { render } from '@testing-library/react';

import ProductItem from './product-item';

describe('ProductItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductItem />);
    expect(baseElement).toBeTruthy();
  });
});
