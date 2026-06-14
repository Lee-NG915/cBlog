import { render } from '@testing-library/react';

import CmsIcon from './cms-icon';

describe('CmsIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CmsIcon />);
    expect(baseElement).toBeTruthy();
  });
});
