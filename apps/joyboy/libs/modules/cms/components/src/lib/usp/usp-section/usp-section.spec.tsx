import { render } from '@testing-library/react';

import UspSection from './usp-section';

describe('UspSection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UspSection />);
    expect(baseElement).toBeTruthy();
  });
});
