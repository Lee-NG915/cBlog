import { render } from '@testing-library/react';

import PosAddWarranty from './pos-add-warranty';

describe('PosAddWarranty', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosAddWarranty />);
    expect(baseElement).toBeTruthy();
  });
});
