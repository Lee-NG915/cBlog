import { render } from '@testing-library/react';

import WebConfigurableProduct from './web-configurable-product';

describe('WebConfigurableProduct', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebConfigurableProduct />);
    expect(baseElement).toBeTruthy();
  });
});
