import { render } from '@testing-library/react';

import CmsText from './cms-text';

describe('CmsText', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CmsText />);
    expect(baseElement).toBeTruthy();
  });
});
