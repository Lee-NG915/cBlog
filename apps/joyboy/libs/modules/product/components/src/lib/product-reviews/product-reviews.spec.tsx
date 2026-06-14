import { render } from '@testing-library/react';

import ProductReviews from './product-reviews.server';

describe('ProductReviews', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductReviews />);
    expect(baseElement).toBeTruthy();
  });
});
