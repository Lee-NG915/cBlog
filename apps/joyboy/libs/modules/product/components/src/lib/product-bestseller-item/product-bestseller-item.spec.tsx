import { render } from '@testing-library/react';

import ProductBestsellerItem from './product-bestseller-item';

describe('ProductBestsellerItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductBestsellerItem />);
    expect(baseElement).toBeTruthy();
  });
});
