'use client';
import { useEffect, useState } from 'react';
import { Box, useNiceModal } from '@castlery/fortress';
import { BackdropLoading } from '@castlery/shared-components';
import { useRecheckInventoryReserveMutation } from '@castlery/modules-order-domain';
import { EcEnv, TransactionApiErrorCode } from '@castlery/config';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';

const SPL_ERROR_CODE_ORDER_STATUS_INVALID = TransactionApiErrorCode.ErrSPLOrderStatusCheckFailed;
const SPL_ERROR_CODE_INVENTORY_RESERVE_FAILED = TransactionApiErrorCode.ErrSPLOrderInventoryReserveFailed;
const recheckingInventoryReservePromises = new Map<
  string,
  Promise<{ stripePaymentLink: string; alreadyPaid: boolean }>
>();

function parseErrorCode(error: unknown): number | null {
  try {
    const parsed = JSON.parse((error as Error).message);
    return parsed?.code ?? null;
  } catch {
    return null;
  }
}

type Props = {
  bizToken: string;
  orderId: string;
};

export function SplTransitPageClient({ bizToken, orderId }: Props) {
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'splTransitPage',
  });
  const [modal, contextHolder] = useNiceModal();
  const [loading, setLoading] = useState(false);
  const [recheckInventoryReserve] = useRecheckInventoryReserveMutation();
  const homeUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY}`.toLowerCase();

  const showRedirectWarningModal = ({ title, subDesc }: { title: string; subDesc: string }) => {
    modal.warning({
      title,
      subDesc,
      showCancelBtn: false,
      confirmText: t('okay'),
      onConfirm: () => {
        window.location.href = homeUrl;
      },
    });
  };

  useEffect(() => {
    if (!bizToken || !orderId) {
      setLoading(false);
      showRedirectWarningModal({
        title: t('paymentLinkExpired.title'),
        subDesc: t('paymentLinkExpired.description'),
      });
      return;
    }

    const recheckKey = `${orderId}:${bizToken}`;
    const existingPromise = recheckingInventoryReservePromises.get(recheckKey);
    const recheckPromise =
      existingPromise ??
      recheckInventoryReserve({ id: orderId, token: bizToken })
        .unwrap()
        .finally(() => {
          recheckingInventoryReservePromises.delete(recheckKey);
        });

    if (!existingPromise) {
      recheckingInventoryReservePromises.set(recheckKey, recheckPromise);
    }

    setLoading(true);

    let isActive = true;

    recheckPromise
      .then((data) => {
        if (!isActive) {
          return;
        }

        if (data?.alreadyPaid) {
          setLoading(false);
          showRedirectWarningModal({
            title: t('paymentLinkExpired.title'),
            subDesc: t('paymentLinkExpired.description'),
          });
          return;
        }

        if (data?.stripePaymentLink) {
          setLoading(false);
          window.location.replace(data.stripePaymentLink);
        }
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setLoading(false);
        const code = parseErrorCode(error);

        if (code === SPL_ERROR_CODE_ORDER_STATUS_INVALID) {
          showRedirectWarningModal({
            title: t('paymentLinkExpired.title'),
            subDesc: t('paymentLinkExpired.description'),
          });
          return;
        }

        if (code === SPL_ERROR_CODE_INVENTORY_RESERVE_FAILED) {
          showRedirectWarningModal({
            title: t('itemUnavailable.title'),
            subDesc: t('itemUnavailable.description'),
          });
          return;
        }

        // Unknown error fallback
        showRedirectWarningModal({
          title: t('unknownError.title'),
          subDesc: t('unknownError.description'),
        });
      });

    return () => {
      isActive = false;
    };
    // intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {contextHolder}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          position: 'relative',
        }}
      >
        {loading && <BackdropLoading loading={true} size="lg" />}
      </Box>
    </>
  );
}
