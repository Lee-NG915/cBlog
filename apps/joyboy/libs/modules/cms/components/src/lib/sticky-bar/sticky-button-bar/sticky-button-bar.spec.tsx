import { render } from '@testing-library/react';

import StickyButtonBar from './sticky-button-bar';

describe('StickyButtonBar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StickyButtonBar />);
    expect(baseElement).toBeTruthy();
  });
});
