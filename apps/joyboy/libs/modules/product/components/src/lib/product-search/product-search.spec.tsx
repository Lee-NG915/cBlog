import { render } from '@testing-library/react';

import ProductSearch from './product-search';

describe('ProductSearch', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductSearch />);
    expect(baseElement).toBeTruthy();
  });
});
