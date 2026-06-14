import { render } from '@testing-library/react';

import CmsBreadcrumbs from './cms-breadcrumbs';

describe('CmsBreadcrumbs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CmsBreadcrumbs />);
    expect(baseElement).toBeTruthy();
  });
});
