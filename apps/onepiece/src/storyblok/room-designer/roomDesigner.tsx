import React, { useEffect, useState } from 'react';
import { Container } from '@castlery/fortress';
import HullaIntegrate from 'containers/RoomCreator/components/Hulla';
import { folders, retailer } from 'containers/RoomCreator/config';

type RoomDesignerProps = {
  blok: {
    preSet?: string;
  };
};

const RoomDesigner = ({ blok }: RoomDesignerProps) => {
  const { preSet } = blok;
  useEffect(() => {
    if (preSet) {
      const currentUrl = new URL(window.location.href);
      currentUrl.search += (currentUrl.search ? '&' : '') + preSet;
      window.history.replaceState({}, '', currentUrl);
    }
  }, [preSet]);
  return (
    <Container>
      <HullaIntegrate folder={folders[__COUNTRY__]} retailer={retailer} />
      {/* <HullaIntegrate folder="modular-configurator" retailer={retailer} /> */}
    </Container>
  );
};

export { RoomDesigner };
