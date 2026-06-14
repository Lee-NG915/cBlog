import { render } from '@testing-library/react';

import ScrollWrapper from './scroll-wrapper';

describe('ScrollWrapper', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ScrollWrapper />);
    expect(baseElement).toBeTruthy();
  });
});
