'use client';
import { useCallback, useMemo } from 'react';
import { Link, Stack, List, ListItem, NiceModal, Typography } from '@castlery/fortress';
import { selectCartCustomizedItems } from '@castlery/modules-cart-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { basePageConfig, EcEnv } from '@castlery/config';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

interface CustomizedItemPopupProps {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  onConfirm: () => void;
}

const LIST_ITEM_SX = { padding: 0, height: 'auto', justifyContent: 'center' } as const;
const TEXT_COLOR_SX = { color: (theme: any) => theme.palette.brand.mono[700] } as const;

export function CustomizedItemPopup({ openModal = false, setOpenModal, onConfirm }: CustomizedItemPopupProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'webCheckoutButton' });
  const customizedItems = useAppSelector(selectCartCustomizedItems);

  // Memoize URL to avoid recalculating on every render
  const salesRefundsUrl = useMemo(
    () =>
      `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY}${basePageConfig['sales-and-refunds']}`.toLowerCase(),
    []
  );

  // Memoize close handler to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    setOpenModal(false);
  }, [setOpenModal]);

  // Early return after all hooks to follow React rules
  if (!customizedItems?.length) return null;

  return (
    <NiceModal
      open={openModal}
      onClose={handleClose}
      warning
      title={t('customizedItemPopupTitle')}
      desc={
        <>
          {t('customizedItemPopupDesc')}
          <Link href={salesRefundsUrl} target="_blank">
            {t('customizedItemPopupLink')}
          </Link>
        </>
      }
      confirmText={t('confirm')}
      onConfirm={onConfirm}
    >
      <Stack>
        <List>
          {customizedItems.map((item) => (
            <ListItem key={item.id} sx={LIST_ITEM_SX}>
              <Typography
                level="caption1"
                sx={TEXT_COLOR_SX}
                startDecorator={
                  <Typography level="body2" sx={TEXT_COLOR_SX}>
                    ·
                  </Typography>
                }
              >
                {item.variant.name}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Stack>
    </NiceModal>
  );
}
