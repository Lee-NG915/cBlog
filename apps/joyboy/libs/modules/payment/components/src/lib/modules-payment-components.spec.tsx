import { render } from '@testing-library/react';

import ModulesPaymentComponents from './modules-payment-components';

describe('ModulesPaymentComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModulesPaymentComponents />);
    expect(baseElement).toBeTruthy();
  });
});
