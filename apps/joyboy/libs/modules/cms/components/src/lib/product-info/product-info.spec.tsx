import { render } from '@testing-library/react';

import ProductInfo from './product_info_a';

describe('ProductInfo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductInfo />);
    expect(baseElement).toBeTruthy();
  });
});
