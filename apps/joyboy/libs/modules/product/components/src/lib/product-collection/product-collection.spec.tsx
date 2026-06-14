import { render } from '@testing-library/react';

import ProductCollection from './product-collection';

describe('ProductCollection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductCollection />);
    expect(baseElement).toBeTruthy();
  });
});
