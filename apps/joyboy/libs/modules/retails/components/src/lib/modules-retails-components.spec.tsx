import { render } from '@testing-library/react';

import ModulesRetailsComponents from './modules-retails-components';

describe('ModulesRetailsComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModulesRetailsComponents />);
    expect(baseElement).toBeTruthy();
  });
});
