import { render } from '@testing-library/react';

import PosDiscountEditor from './pos-discount-editor';

describe('PosDiscountEditor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosDiscountEditor />);
    expect(baseElement).toBeTruthy();
  });
});
