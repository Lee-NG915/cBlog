import { render } from '@testing-library/react';

import CmsYotpoBanner from './cms-yotpo-banner';

describe('CmsYotpoBanner', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CmsYotpoBanner />);
    expect(baseElement).toBeTruthy();
  });
});
