'use client';
import { Stack, Typography, Tooltip, IconButton, useBreakpoints, Box } from '@castlery/fortress';
import { InfoThin, Close } from '@castlery/fortress/Icons';
import { toPrice } from '@castlery/utils';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { cartFeatureService } from '@castlery/modules-cart-services';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCartSummary } from '@castlery/modules-cart-domain';
import { useState, useMemo, useCallback } from 'react';

const ICON_SIZE_DESKTOP = 20;
const ICON_SIZE_MOBILE = 16;

export function WebTotalItem({
  direction = 'row',
}: {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
}) {
  const summary = useAppSelector(selectCartSummary);
  const showTotalWithTax = cartFeatureService.showTotalWithTax;
  const [open, setOpen] = useState(false);
  const { mobile } = useBreakpoints();

  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'webCartSummary' });

  const totalPrice = useMemo(() => {
    const total = 'total' in summary ? summary.total : undefined;
    return toPrice(Number(total ?? 0));
  }, [summary]);
  const totalWithTaxTooltip = useMemo(() => t('totalWithTaxTooltip' as any), [t]);
  const iconSize = useMemo(() => (mobile ? ICON_SIZE_MOBILE : ICON_SIZE_DESKTOP), [mobile]);

  const handleOpenTooltip = useCallback((e?: React.MouseEvent | React.TouchEvent | React.FocusEvent) => {
    e?.stopPropagation();
    setOpen(true);
  }, []);

  const handleCloseTooltip = useCallback(() => {
    setOpen(false);
  }, []);

  const handleCloseTooltipFromButton = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
  }, []);

  const tooltipTitle = useMemo(
    () => (
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ maxWidth: 200, gap: 1 }}>
        <Typography level="caption1">{totalWithTaxTooltip}</Typography>
        <IconButton
          sx={{
            m: 0,
            p: 0,
            color: (theme) => theme.palette.common.white,
            '&:hover': { color: (theme) => theme.palette.common.white, opacity: 0.6 },
          }}
          onClick={handleCloseTooltipFromButton}
        >
          <Close />
        </IconButton>
      </Box>
    ),
    [totalWithTaxTooltip, handleCloseTooltipFromButton]
  );

  const iconButtonSx = useMemo(
    () => ({
      p: 0,
      m: 0,
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    }),
    [iconSize]
  );

  const iconSx = useMemo(
    () => ({
      width: iconSize,
      height: iconSize,
      fontSize: iconSize,
      ml: 0.5,
    }),
    [iconSize]
  );

  return (
    <Stack direction={direction} justifyContent="space-between" alignItems="center" width="100%">
      <Typography level="h4">{totalPrice}</Typography>
      <Tooltip
        arrow
        theme="dark"
        placement="top"
        disableFocusListener
        enterTouchDelay={0}
        leaveTouchDelay={5000}
        title={tooltipTitle}
        onClose={handleCloseTooltip}
        open={open}
      >
        <IconButton
          color="neutral"
          onClick={handleOpenTooltip}
          onTouchStart={handleOpenTooltip}
          onFocus={handleOpenTooltip}
          onBlur={handleCloseTooltip}
          sx={iconButtonSx}
        >
          <Typography level="body2" sx={{ color: (theme) => theme.palette.brand.maroonVelvet[500] }}>
            {t('total' as any)}
          </Typography>
          {showTotalWithTax && (
            <>
              <Typography level="body2" sx={{ color: (theme) => theme.palette.brand.maroonVelvet[500] }}>
                {t('totalWithTax' as any)}
              </Typography>
              <InfoThin fill="#3C101E" sx={iconSx} />
            </>
          )}
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
