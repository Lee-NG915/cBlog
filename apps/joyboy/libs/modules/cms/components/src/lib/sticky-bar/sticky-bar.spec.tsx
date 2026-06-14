import { render } from '@testing-library/react';

import StickyBar from './sticky-bar';

describe('StickyBar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StickyBar />);
    expect(baseElement).toBeTruthy();
  });
});
