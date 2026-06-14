import { render } from '@testing-library/react';

import WebShipping from './web-shipping';

describe('WebPlaShipping', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebShipping />);
    expect(baseElement).toBeTruthy();
  });
});
