import { render } from '@testing-library/react';

import ProductOptionsLine from './product-options-line';

describe('ProductOptionsLine', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductOptionsLine />);
    expect(baseElement).toBeTruthy();
  });
});
