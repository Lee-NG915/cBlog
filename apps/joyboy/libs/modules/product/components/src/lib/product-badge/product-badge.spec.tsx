import { render } from '@testing-library/react';

import ProductBadge from './product-badge';

describe('ProductBadge', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductBadge />);
    expect(baseElement).toBeTruthy();
  });
});
