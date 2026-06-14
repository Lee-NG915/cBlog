'use client';
import { useState } from 'react';
import { Typography, Drawer, DialogContent, Tag, IconButton } from '@castlery/fortress';
import { Leaf, Info } from '@castlery/fortress/Icons';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { EcoDeliveryDetails } from '../eco-delivery-details/eco-delivery-details';

export function InlineEcoDeliveryTip() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(LocalesNamespace.SHARED, { keyPrefix: 'ecoDelivery' });

  return (
    <>
      <Tag color="success">
        <Leaf />
        <Typography level="caption1">{t('inlineTip' as any)}</Typography>
        <IconButton
          variant="tertiary"
          onClick={() => setOpen(true)}
          sx={{ p: 0, minHeight: 'unset', height: 'auto', flexShrink: 0 }}
        >
          <Info sx={{ color: (theme) => theme.palette.brand.warmLinen[500] }} />
        </IconButton>
      </Tag>

      <Drawer showCloseButton={true} open={open} onClose={() => setOpen(false)} title={t('main.title' as any)}>
        <DialogContent sx={{ gap: 4, px: 6 }}>
          <EcoDeliveryDetails onClose={() => setOpen(false)} />
        </DialogContent>
      </Drawer>
    </>
  );
}
