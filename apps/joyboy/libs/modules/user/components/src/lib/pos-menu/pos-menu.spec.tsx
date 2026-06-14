import { render } from '@testing-library/react';

import PosMenu from './pos-menu';

describe('PosMenu', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosMenu />);
    expect(baseElement).toBeTruthy();
  });
});
