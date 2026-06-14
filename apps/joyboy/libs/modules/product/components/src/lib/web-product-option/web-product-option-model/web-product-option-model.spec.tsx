import { render } from '@testing-library/react';

import WebProductOptionModel from './web-product-option-model';

describe('WebProductOptionModel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebProductOptionModel />);
    expect(baseElement).toBeTruthy();
  });
});
