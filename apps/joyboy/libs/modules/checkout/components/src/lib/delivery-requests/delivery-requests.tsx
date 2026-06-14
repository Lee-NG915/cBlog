'use client';

import { Stack, Typography, Textarea, Link } from '@castlery/fortress';
import { useTranslation, LocalesNamespace, Trans } from '@castlery/monorepo-i18n';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { selectDeliveryRequests, setLocalDeliveryRequests } from '@castlery/modules-checkout-domain';
import { useState } from 'react';
import { useDebounce } from 'react-use';
import { CheckoutShippingMethodSchema } from '@castlery/types';
import { EcEnv, basePageConfig } from '@castlery/config';

export const DeliveryRequests = () => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'deliveryRequests',
  });
  const dispatch = useAppDispatch();
  const deliveryRequests = useAppSelector(selectDeliveryRequests) as
    | CheckoutShippingMethodSchema['deliveryRequests']
    | null;
  const [value, setValue] = useState(deliveryRequests?.text || '');

  useDebounce(
    () => {
      if (value) {
        dispatch(setLocalDeliveryRequests(value));
      }
    },
    1000,
    [value]
  );

  const notes =
    (t('notes', {
      returnObjects: true,
    }) as string[]) || [];

  const deliveryPolicyUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig.delivery}`;

  if (!deliveryRequests?.enableDeliveryRequest) {
    return null;
  }

  return (
    <Stack>
      <Typography level="h3" mb={6}>
        {t('title')}
      </Typography>
      {/* 增加输入框敏感校验，尤其是xss攻击相关的转化 */}
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder={t('placeholder')} maxRows={4} />
      <Stack sx={{ mt: 2 }}>
        <Typography level="caption2">{t('notesTitle')}</Typography>
        {notes.map((note: string, index: number) => (
          <Typography key={index} level="caption2" component="span" sx={{ display: 'block' }}>
            {index === 1 ? (
              <Trans
                i18nKey="deliveryRequests.notes.1"
                ns={LocalesNamespace.MODULES_CHECKOUT}
                components={{
                  1: <Link href={deliveryPolicyUrl} variant="secondary" target="_blank" rel="noopener noreferrer" />,
                }}
              />
            ) : (
              note
            )}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
};

export default DeliveryRequests;
