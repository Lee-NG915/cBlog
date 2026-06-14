import { render } from '@testing-library/react';

import WebProductOption from './web-product-option';

describe('WebProductOption', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebProductOption />);
    expect(baseElement).toBeTruthy();
  });
});
