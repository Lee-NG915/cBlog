import { render } from '@testing-library/react';

import PosOrderComment from './pos-order-comment';

describe('PosOrderComment', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosOrderComment />);
    expect(baseElement).toBeTruthy();
  });
});
