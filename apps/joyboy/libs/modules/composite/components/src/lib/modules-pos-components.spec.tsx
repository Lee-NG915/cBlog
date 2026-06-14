import { render } from '@testing-library/react';

import ModulesPosComponents from './modules-pos-components';

describe('ModulesPosComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModulesPosComponents />);
    expect(baseElement).toBeTruthy();
  });
});
