'use client';

import { Typography, Stack, Tooltip, IconButton, useBreakpoints, Box } from '@castlery/fortress';
import { Close, InfoThin } from '@castlery/fortress/Icons';
import { SummaryRow } from './summary-row';
import { useState, useMemo, useCallback } from 'react';

const ICON_SIZE_DESKTOP = 20;
const ICON_SIZE_MOBILE = 16;

export interface TotalItemProps {
  label: string; // t('total')
  total: string;
  totalWithTaxLabel?: string; // t('totalWithTax')
  totalWithTaxTooltip?: string; // t('totalWithTaxTooltip')
  showTotalWithTax?: boolean;
  addonDescription?: string;
  loading?: boolean;
  forcePadding?: boolean;
}

export function TotalItem({
  label,
  totalWithTaxLabel,
  totalWithTaxTooltip,
  total,
  showTotalWithTax = false,
  addonDescription,
  loading,
  forcePadding,
}: TotalItemProps) {
  const { mobile } = useBreakpoints();
  const [open, setOpen] = useState(false);

  const iconSize = useMemo(() => (mobile ? ICON_SIZE_MOBILE : ICON_SIZE_DESKTOP), [mobile]);

  const handleOpenTooltip = useCallback(
    (e?: React.MouseEvent | React.FocusEvent) => {
      if (!showTotalWithTax) return;
      e?.stopPropagation();
      setOpen(true);
    },
    [showTotalWithTax]
  );

  const handleCloseTooltip = useCallback(() => {
    setOpen(false);
  }, []);

  const handleCloseTooltipFromButton = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
  }, []);

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
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
      height: iconSize,
      width: iconSize,
      minHeight: iconSize,
      p: 0,
      m: 0,
    }),
    [iconSize]
  );

  const iconSx = useMemo(
    () => ({
      width: iconSize,
      height: iconSize,
      fontSize: iconSize,
    }),
    [iconSize]
  );

  const labelText = useMemo(
    () => `${label}${showTotalWithTax ? ` ${totalWithTaxLabel || ''}` : ''}`,
    [label, showTotalWithTax, totalWithTaxLabel]
  );

  return (
    <SummaryRow loading={loading} forcePadding={forcePadding}>
      <Stack
        // 改动原因：Pos cart summary total item layout wrap
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        sx={{ cursor: showTotalWithTax ? 'pointer' : 'default' }}
        {...(showTotalWithTax
          ? {
              onClick: handleOpenTooltip,
              onMouseEnter: handleOpenTooltip,
              onMouseLeave: handleCloseTooltip,
              onFocus: handleOpenTooltip,
              onBlur: handleCloseTooltip,
            }
          : {})}
      >
        <Stack direction="row" alignItems="center" justifyContent="flex-start">
          <Typography level="body1" mr={1} sx={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
            {labelText}
          </Typography>
          {showTotalWithTax && (
            <Tooltip
              arrow
              theme="dark"
              placement="top"
              disableFocusListener
              disableHoverListener
              disableTouchListener
              title={tooltipTitle}
              onClose={handleCloseTooltip}
              open={open}
            >
              <IconButton variant="plain" color="neutral" sx={iconButtonSx} onClick={handleStopPropagation}>
                <InfoThin fill="#3C101E" sx={iconSx} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {!!addonDescription && (
          <Typography level="body2" sx={{ color: (theme) => theme.palette.brand.charcoal[500] }}>
            ({addonDescription})
          </Typography>
        )}
      </Stack>
      <Typography level="body1">{total}</Typography>
    </SummaryRow>
  );
}
