import { render } from '@testing-library/react';

import WebGallery from './web-gallery';

describe('WebPlaGallery', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebGallery />);
    expect(baseElement).toBeTruthy();
  });
});
