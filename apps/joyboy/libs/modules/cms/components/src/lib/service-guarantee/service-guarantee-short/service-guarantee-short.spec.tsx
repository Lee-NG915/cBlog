import { render } from '@testing-library/react';

import ServiceGuaranteeShort from './service-guarantee-short';

describe('ServiceGuaranteeShort', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ServiceGuaranteeShort />);
    expect(baseElement).toBeTruthy();
  });
});
