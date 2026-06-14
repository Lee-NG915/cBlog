import { render } from '@testing-library/react';

import WebProductInfoItem from './web-product-info-item';

describe('WebProductInfoItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebProductInfoItem />);
    expect(baseElement).toBeTruthy();
  });
});
