import { render } from '@testing-library/react';

import ModulesCheckoutComponents from './modules-checkout-components';

describe('ModulesCheckoutComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModulesCheckoutComponents />);
    expect(baseElement).toBeTruthy();
  });
});
