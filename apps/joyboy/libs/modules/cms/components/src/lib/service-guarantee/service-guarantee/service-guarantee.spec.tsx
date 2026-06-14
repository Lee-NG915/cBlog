import { render } from '@testing-library/react';

import ServiceGuarantee from './service-guarantee';

describe('ServiceGuarantee', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ServiceGuarantee />);
    expect(baseElement).toBeTruthy();
  });
});
