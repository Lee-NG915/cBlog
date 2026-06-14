import { render } from '@testing-library/react';

import CmsBlogBanner from './cms-blog-banner';

describe('CmsBlogBanner', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CmsBlogBanner />);
    expect(baseElement).toBeTruthy();
  });
});
