import { render } from '@testing-library/react';

import BaseTypography from './base-typography';

describe('BaseTypography', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BaseTypography />);
    expect(baseElement).toBeTruthy();
  });
});
