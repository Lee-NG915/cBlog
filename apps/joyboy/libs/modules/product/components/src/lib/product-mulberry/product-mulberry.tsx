'use client';

import { EcEnv } from '@castlery/config';
import { selectDiscontinued } from '@castlery/modules-product-domain';
import { MulberryManager } from '@castlery/shared-components';
import { useState } from 'react';
import { ProductMulberryPicker } from './product-mulberry-picker';
import { useAppSelector } from '@castlery/shared-redux-store';

export const ProductMulberry = () => {
  const discontinued = useAppSelector(selectDiscontinued);
  const [hadInitMulberry, setHadInitMulberry] = useState(false);
  return (
    <>
      {!discontinued && EcEnv.NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN !== '' && (
        <MulberryManager loadSuccess={() => setHadInitMulberry(true)} />
      )}
      {hadInitMulberry && <ProductMulberryPicker />}
    </>
  );
};
