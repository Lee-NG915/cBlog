import { render } from '@testing-library/react';
import { shopTheLook } from './mock';
import { ShopTheLook } from './shop-the-look';
import React from 'react';
describe('Reviews', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ShopTheLook blok={shopTheLook} />);
    expect(baseElement).toBeTruthy();
  });
});
