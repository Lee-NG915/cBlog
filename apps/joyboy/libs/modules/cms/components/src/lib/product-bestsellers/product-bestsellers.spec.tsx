import { render } from '@testing-library/react';

import ProductBestsellers from './product-bestsellers';

describe('ProductBestsellers', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductBestsellers />);
    expect(baseElement).toBeTruthy();
  });
});
