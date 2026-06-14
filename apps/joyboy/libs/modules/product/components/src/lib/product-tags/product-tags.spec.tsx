import { render } from '@testing-library/react';

import ProductTags from './product-tags';

describe('ProductTags', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductTags />);
    expect(baseElement).toBeTruthy();
  });
});
