import { render } from '@testing-library/react';

import PosWarrantyItem from './pos-warranty-item';

describe('PosWarrantyItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosWarrantyItem />);
    expect(baseElement).toBeTruthy();
  });
});
