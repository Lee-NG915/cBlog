import { render } from '@testing-library/react';

import CmsProductOption from './cms-product-option';

describe('WebProductOptionTsx', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CmsProductOption />);
    expect(baseElement).toBeTruthy();
  });
});
