import { render } from '@testing-library/react';

import MulberryManager from './mulberry-manager';

describe('MulberryManager', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MulberryManager />);
    expect(baseElement).toBeTruthy();
  });
});
