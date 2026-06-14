import { render } from '@testing-library/react';

import PosQtyEditor from './pos-qty-editor';

describe('PosQtyEditor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosQtyEditor />);
    expect(baseElement).toBeTruthy();
  });
});
