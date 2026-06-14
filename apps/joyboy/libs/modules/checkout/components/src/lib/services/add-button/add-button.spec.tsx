import { render } from '@testing-library/react';

import AddButton from './add-button';

describe('AddButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AddButton />);
    expect(baseElement).toBeTruthy();
  });
});
