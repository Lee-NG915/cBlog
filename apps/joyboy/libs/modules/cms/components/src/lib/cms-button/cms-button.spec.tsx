import { render } from '@testing-library/react';

import CmsButton from './cms-button';

describe('CmsButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CmsButton />);
    expect(baseElement).toBeTruthy();
  });
});
