import { render } from '@testing-library/react';

import PushToOnline from './push-to-online';

describe('PushToOnline', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PushToOnline />);
    expect(baseElement).toBeTruthy();
  });
});
