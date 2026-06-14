'use client';

import { ModalClose, Stack, useBreakpoints } from '@castlery/fortress';
import CountTip from './count-tip';
import { CartRefreshButton } from '@castlery/modules-cart-components';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { DATA_SELENIUM_ID_MAP } from '@castlery/utils';

export const MiniCartTitle = ({ isEmptyCart, onClose }: { isEmptyCart: boolean; onClose: () => void }) => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'emptyCart' });
  const { xs } = useBreakpoints();
  return (
    <Stack direction="row" alignItems="center" gap={4}>
      {isEmptyCart ? (
        t('title')
      ) : (
        <>
          <CountTip />
          <CartRefreshButton surface="miniCart" />
        </>
      )}
      {!xs && <ModalClose sx={{ float: 'right' }} onClick={onClose} data-selenium={DATA_SELENIUM_ID_MAP.CLOSE_CART} />}
    </Stack>
  );
};
