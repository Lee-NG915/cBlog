import { render } from '@testing-library/react';

import ProductCubeItem from './product-cube-item';

describe('ProductCubeItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductCubeItem />);
    expect(baseElement).toBeTruthy();
  });
});
