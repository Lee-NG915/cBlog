import { render } from '@testing-library/react';

import MediaVideo from './media-video';

describe('MediaVideo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MediaVideo />);
    expect(baseElement).toBeTruthy();
  });
});
