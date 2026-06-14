import { render } from '@testing-library/react';

import PosOverwritePriceEditor from './pos-overwrite-price-editor';

describe('PosOverwritePriceEditor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosOverwritePriceEditor lineItemId={'123435'} amount="100" />);
    expect(baseElement).toBeTruthy();
  });
});
