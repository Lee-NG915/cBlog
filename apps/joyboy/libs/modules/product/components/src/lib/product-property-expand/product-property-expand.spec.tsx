import { render } from '@testing-library/react';

import ProductPropertyExpand from './product-property-expand';

describe('ProductPropertyExpand', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductPropertyExpand />);
    expect(baseElement).toBeTruthy();
  });
});
