// import React from 'react';
import { Button } from '@castlery/fortress';
import Checkbox from '@castlery/fortress/Checkbox';
import { AUFlag } from '@castlery/fortress/Icons';
import { asyncLoad } from 'components/AsyncLoad/utils';

function ShopTheLook() {
  return (
    <div>
      <h1>Shop The Look</h1>
      <p>Seeking inspiration for a home makeover? Explore our curated spaces and discover all that home can be.</p>
      <Button>Button</Button>
      <AUFlag>Button</AUFlag>
      Checkbox: <Checkbox />
    </div>
  );
}
export default asyncLoad([])(ShopTheLook);
