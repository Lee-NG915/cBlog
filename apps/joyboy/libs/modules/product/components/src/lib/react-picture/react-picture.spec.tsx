import { render } from '@testing-library/react';

import ReactPicture from './react-picture';

describe('ReactPicture', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactPicture />);
    expect(baseElement).toBeTruthy();
  });
});
