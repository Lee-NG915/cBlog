import { render } from '@testing-library/react';

import ModulesCmsComponents from './modules-cms-components';

describe('ModulesCmsComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModulesCmsComponents />);
    expect(baseElement).toBeTruthy();
  });
});
