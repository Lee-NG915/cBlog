import { render } from '@testing-library/react';

import ProductTag from './product-tag';

describe('ProductTag', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductTag />);
    expect(baseElement).toBeTruthy();
  });
});
