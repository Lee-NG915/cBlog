import React from 'react';
import { wrapPage } from 'utils/page';
import { Container } from '@castlery/fortress';
import HullaIntegrate from './components/Hulla';
import { folders, retailer } from './config';

function RoomCreator() {
  return (
    <Container>
      <HullaIntegrate folder={folders[__COUNTRY__]} retailer={retailer} />
      {/* <HullaIntegrate folder="modular-configurator" retailer={retailer} /> */}
    </Container>
  );
}

export default wrapPage()(RoomCreator);
