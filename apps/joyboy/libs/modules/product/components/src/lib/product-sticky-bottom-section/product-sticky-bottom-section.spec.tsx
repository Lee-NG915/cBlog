import { render } from '@testing-library/react';

import ProductStickyBottomSection from './product-sticky-bottom-section';

describe('ProductStickyBottomSection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductStickyBottomSection />);
    expect(baseElement).toBeTruthy();
  });
});
