import { render } from '@testing-library/react';

import ProductPropertyMixedGroup from './product-property-mixed-group';

describe('ProductPropertyMixedGroup', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductPropertyMixedGroup />);
    expect(baseElement).toBeTruthy();
  });
});
