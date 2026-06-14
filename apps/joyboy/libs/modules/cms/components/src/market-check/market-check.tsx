'use client';

import { Button, NiceModal } from '@castlery/fortress';
import { useState, useEffect } from 'react';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/client';

const COUNTRIES = {
  US: {
    name: 'United States',
    code: 'US',
    route: '/us',
  },
  SG: {
    name: 'Singapore',
    code: 'SG',
    route: '/sg',
  },
  AU: {
    name: 'Australia',
    code: 'AU',
    route: '/au',
  },
  CA: {
    name: 'Canada',
    code: 'CA',
    route: '/ca',
  },
  UK: {
    name: 'United Kingdom',
    code: 'UK',
    route: '/uk',
  },
};

const MarketCheck = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [countryCode, setCountryCode] = useState('');
  const persistenceHandles = makePersistenceHandles();

  useEffect(() => {
    // 在客户端环境中安全地获取 countryCode
    try {
      const code = persistenceHandles.webCountryCode.getItem() || '';
      setCountryCode(code);
      if (Object.keys(COUNTRIES).includes(code) && EcEnv.NEXT_PUBLIC_COUNTRY !== code) {
        const selectedCountryHintHidden = persistenceHandles.selectedCountryHintHidden.getItem();
        if (selectedCountryHintHidden) {
          setModalOpen(false);
        } else {
          persistenceHandles.selectedCountryHintHidden.setItem('true');
          setModalOpen(true);
        }
      } else {
        setModalOpen(false);
      }
    } catch (error) {
      logger.error('Failed to get country code for market check', { error });
      setModalOpen(false);
    }
  }, []);
  return (
    <NiceModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      title={`It looks like you're browsing from ${
        countryCode && COUNTRIES[countryCode as keyof typeof COUNTRIES]?.name
      }?`}
      desc="Would you like to shop our site in your country?"
      showCancelBtn={false}
      showConfirmBtn={false}
    >
      <Button
        sx={(theme) => ({
          width: '100%',
          mb: theme.spacing(3),
        })}
        onClick={() => {
          window.location.href = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}${
            countryCode && COUNTRIES[countryCode as keyof typeof COUNTRIES]?.route
          }`;
        }}
      >
        {`SHOP IN ${countryCode && COUNTRIES[countryCode as keyof typeof COUNTRIES]?.name.toLocaleUpperCase()}`}
      </Button>
      <Button
        variant="plain"
        onClick={() => {
          setModalOpen(false);
          persistenceHandles.selectedCountryHintHidden.setItem('true');
        }}
        sx={(theme) => ({ width: '100%', color: theme.palette.brand.maroonVelvet[600] })}
      >
        STAY ON CURRENT SITE
      </Button>
    </NiceModal>
  );
};

export { MarketCheck };
