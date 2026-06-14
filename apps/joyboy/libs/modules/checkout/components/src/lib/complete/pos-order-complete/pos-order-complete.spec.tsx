import { render } from '@testing-library/react';

import PosOrderComplete from './pos-order-complete';

describe('PosOrderComplete', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosOrderComplete />);
    expect(baseElement).toBeTruthy();
  });
});
