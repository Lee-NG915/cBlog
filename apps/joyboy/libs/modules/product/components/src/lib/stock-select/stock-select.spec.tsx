import { render } from '@testing-library/react';

import StockSelect from './stock-select';

describe('StockSelect', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StockSelect />);
    expect(baseElement).toBeTruthy();
  });
});
