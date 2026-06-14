import { render } from '@testing-library/react';

import FortressVideo from './fortress-video';

describe('FortressVideo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FortressVideo />);
    expect(baseElement).toBeTruthy();
  });
});
