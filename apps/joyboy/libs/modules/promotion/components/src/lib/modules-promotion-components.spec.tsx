import { render } from '@testing-library/react';

import ModulesPromotionComponents from './modules-promotion-components';

describe('ModulesPromotionComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModulesPromotionComponents />);
    expect(baseElement).toBeTruthy();
  });
});
