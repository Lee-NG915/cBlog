import { render } from '@testing-library/react';

import CmsBrandIntroduction from './cms-brand-info';

describe('CmsBrandIntroduction', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CmsBrandIntroduction />);
    expect(baseElement).toBeTruthy();
  });
});
