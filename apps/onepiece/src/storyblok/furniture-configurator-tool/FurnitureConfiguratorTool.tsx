import HullaIntegrate from 'containers/DesignFurniture/components/Hulla';
import { modularFolders, retailer } from 'containers/DesignFurniture/config';
import { Container } from '@castlery/fortress';
import React, { useEffect } from 'react';

type FurnitureConfiguratorToolProps = {
  blok: {
    preSet?: string;
  };
};

const FurnitureConfiguratorTool = ({ blok }: FurnitureConfiguratorToolProps) => {
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
      <HullaIntegrate folder={modularFolders[__COUNTRY__]} retailer={retailer} />
    </Container>
  );
};

export { FurnitureConfiguratorTool };
