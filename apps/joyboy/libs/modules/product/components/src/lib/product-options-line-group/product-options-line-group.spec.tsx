import { render } from '@testing-library/react';

import ProductOptionsLineGroup from './product-options-line-group';

describe('ProductOptionsLineGroup', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductOptionsLineGroup />);
    expect(baseElement).toBeTruthy();
  });
});
