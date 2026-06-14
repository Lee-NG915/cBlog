import { render } from '@testing-library/react';

import JoyImage from './fortress-image';

describe('JoyImage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<JoyImage />);
    expect(baseElement).toBeTruthy();
  });
});
