import { render } from '@testing-library/react';

import WebDetail from './web-detail';

describe('WebPlaDetail', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebDetail />);
    expect(baseElement).toBeTruthy();
  });
});
