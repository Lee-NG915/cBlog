import { render } from '@testing-library/react';

import CmsLink from './cms-link';

describe('CmsLink', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CmsLink />);
    expect(baseElement).toBeTruthy();
  });
});
