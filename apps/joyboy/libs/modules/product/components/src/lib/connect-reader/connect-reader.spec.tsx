import { render } from '@testing-library/react';

import ConnectReader from './connect-reader';

describe('ConnectReader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ConnectReader />);
    expect(baseElement).toBeTruthy();
  });
});
