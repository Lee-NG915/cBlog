import { render } from '@testing-library/react';

import WebConfig from './web-config';

describe('WebPlaConfig', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebConfig />);
    expect(baseElement).toBeTruthy();
  });
});
