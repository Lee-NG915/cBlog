import { render } from '@testing-library/react';

import PosOverwritePriceEditor from './pos-overwrite-price-editor';

describe('PosOverwritePriceEditor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosOverwritePriceEditor />);
    expect(baseElement).toBeTruthy();
  });
});
