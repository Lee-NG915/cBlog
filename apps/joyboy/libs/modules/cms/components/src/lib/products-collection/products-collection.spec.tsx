import { render } from '@testing-library/react';

import ProductsCollection from './products-collection';

describe('ProductsCollection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductsCollection />);
    expect(baseElement).toBeTruthy();
  });
});
