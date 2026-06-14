import React from 'react';
import { wrapPage } from 'utils/page';
import { Container } from '@castlery/fortress';
import HullaIntegrate from './components/Hulla';
import { modularFolders, retailer } from './config';

function DesignFurniture() {
  return (
    <Container>
      {/* <HullaIntegrate folder={folders[__COUNTRY__]} retailer={retailer} /> */}
      <HullaIntegrate folder={modularFolders[__COUNTRY__]} retailer={retailer} />
    </Container>
  );
}

export default wrapPage()(DesignFurniture);
