'use client';
import { accessInWeb } from '@castlery/config';
import {
  AutocompleteOption,
  Box,
  ListItemContent,
  Stack,
  Typography,
  Link,
  Tooltip,
  IconButton,
  useBreakpoints,
} from '@castlery/fortress';
import { Info } from '@castlery/fortress/Icons';
import { type CouponWalletOption, CouponWalletOptionType } from '@castlery/modules-promotion-domain';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const largeBgImageMapping = {
  static: 'https://res.cloudinary.com/castlery/image/upload/v1762847725/Website%20Tech/coupon_card_desktop.png',
  selected: 'https://res.cloudinary.com/castlery/image/upload/v1762847725/Website%20Tech/coupon_card_desktop_hover.png',
};
const mobileBgImageMapping = {
  static: 'https://res.cloudinary.com/castlery/image/upload/v1762847725/Website%20Tech/coupon_card_mobile.png',
  selected: 'https://res.cloudinary.com/castlery/image/upload/v1762847999/Website%20Tech/coupon_card_mobile_hover.png',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InfoTooltipProps {
  title: React.ReactNode;
  placement?: 'top' | 'top-end' | 'top-start';
  size?: number;
  disabled?: boolean;
  noHighlight?: boolean;
}

function InfoTooltip({ title, placement = 'top', size = 20, disabled, noHighlight }: InfoTooltipProps) {
  const stopOptionSelection = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <Tooltip title={title} variant="solid" arrow placement={placement} sx={{ maxWidth: 280 }}>
      <IconButton
        sx={{
          p: 0,
          m: 0,
          width: size,
          height: size,
          minHeight: size,
          minWidth: size,
          color: 'inherit',
          ...(noHighlight && { '&:hover, &:active, &:focus': { color: 'inherit', background: 'transparent' } }),
        }}
        disabled={disabled}
        data-coupon-info-icon="true"
        onMouseDown={stopOptionSelection}
        onClick={stopOptionSelection}
      >
        <Info sx={{ width: size, height: size, fontSize: size, color: 'inherit' }} />
      </IconButton>
    </Tooltip>
  );
}

interface TruncatedLabelProps {
  tooltipTitle: string;
  isMobileSize: boolean;
  sx?: object;
  endDecorator?: React.ReactNode;
  children: React.ReactNode;
}

function TruncatedLabel({ tooltipTitle, isMobileSize, sx, endDecorator, children }: TruncatedLabelProps) {
  const labelRef = useRef<HTMLElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    const el = labelRef.current;
    if (el) setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [tooltipTitle]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isMobileSize && isTruncated) {
        e.stopPropagation();
        setTooltipOpen((prev) => !prev);
      }
    },
    [isMobileSize, isTruncated]
  );

  return (
    <Tooltip
      title={tooltipTitle}
      variant="solid"
      arrow
      placement="top"
      sx={{ maxWidth: 280 }}
      {...(isMobileSize
        ? { open: isTruncated ? tooltipOpen : false, disableHoverListener: true, disableFocusListener: true }
        : { disableHoverListener: !isTruncated })}
    >
      <Typography
        level="h5"
        onClick={handleClick}
        sx={{ display: 'flex', alignItems: 'center', minWidth: 0, ...sx }}
        endDecorator={endDecorator}
      >
        <Box
          component="span"
          ref={labelRef}
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
        >
          {children}
        </Box>
      </Typography>
    </Tooltip>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface WalletOption extends CouponWalletOption {
  insertHint?: string | React.ReactNode;
}

interface CouponWalletAutocompleteOptionProps {
  propsRawData: any;
  option: WalletOption;
  loading?: boolean;
}

function CouponWalletAutocompleteOptionComponent({
  option,
  propsRawData,
  loading = false,
}: CouponWalletAutocompleteOptionProps) {
  const { label, ruleDescription, upgradeDescription, expiredAt, value, type, unavailableReason, insertHint, cost } =
    option;

  const disabled = propsRawData['aria-disabled'];
  const selected = propsRawData['aria-selected'];

  const { mobile, tablet } = useBreakpoints();
  const isMobileSize = accessInWeb ? mobile : !tablet;

  const upgradeLines = useMemo(() => upgradeDescription?.split('\n').filter(Boolean) ?? [], [upgradeDescription]);

  const bgImageMapping = useMemo(
    () =>
      accessInWeb
        ? mobile
          ? mobileBgImageMapping
          : largeBgImageMapping
        : tablet
        ? largeBgImageMapping
        : mobileBgImageMapping,
    [mobile, tablet]
  );

  const dropdownOptionStyles = useMemo(
    () =>
      accessInWeb
        ? {
            optionStyles: { m: 0, px: '0 !important', py: '0 !important' },
            listItemContentStyles: {
              width: '100%',
              height: { xs: 92, sm: 95, md: 66, lg: 69, xl: 97 },
              maxHeight: 97,
              rowGap: { xs: 6, sm: 3, md: 3, lg: 4, xl: 6 },
              m: 0,
            },
            couponContentStyles: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              columnGap: 3,
              width: '85%',
            },
            addonTitleStyles: { ml: 1 },
          }
        : {
            optionStyles: { m: 0, py: 0, px: mobile ? 1 : 2 },
            listItemContentStyles: {
              px: 3,
              width: tablet ? 435 : 370,
              height: tablet ? 78 : 95,
              backgroundSize: tablet ? 'cover' : 'contain',
              rowGap: { xs: 4, sm: 5, md: 6 },
            },
            couponContentStyles: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              columnGap: 1,
              width: '85%',
            },
            addonTitleStyles: { ml: 0.5 },
          },
    [mobile, tablet]
  );

  const isInfoIconTarget = useCallback((target: EventTarget | null) => {
    return target instanceof HTMLElement && !!target.closest('[data-coupon-info-icon="true"]');
  }, []);

  const handleOptionMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!disabled) {
        propsRawData.onMouseDown?.(event);
        return;
      }

      if (isInfoIconTarget(event.target)) return;

      event.preventDefault();
      event.stopPropagation();
    },
    [disabled, isInfoIconTarget, propsRawData]
  );

  const handleOptionClick = useCallback(
    (event: React.MouseEvent) => {
      if (!disabled) {
        propsRawData.onClick?.(event);
        return;
      }

      if (isInfoIconTarget(event.target)) return;

      event.preventDefault();
      event.stopPropagation();
    },
    [disabled, isInfoIconTarget, propsRawData]
  );

  return (
    <>
      {!!insertHint && insertHint}
      <AutocompleteOption
        {...propsRawData}
        variant="text"
        onMouseDown={handleOptionMouseDown}
        onClick={handleOptionClick}
        sx={{ ...dropdownOptionStyles.optionStyles, opacity: loading ? 0.3 : 1 }}
      >
        <ListItemContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            m: 0,
            cursor: disabled ? 'default' : 'pointer',
            background: `url(${
              selected ? bgImageMapping.selected : bgImageMapping.static
            }) no-repeat center center/contain`,
            ...dropdownOptionStyles.listItemContentStyles,
            opacity: disabled ? 0.6 : 1,
            color: (theme) =>
              disabled
                ? theme.palette.brand.mono[500]
                : selected
                ? theme.palette.brand.terracotta[500]
                : theme.palette.brand.mono[900],
            ...(!disabled && {
              '&:hover': {
                background: `url(${bgImageMapping.selected}) no-repeat center center/contain`,
                color: (theme) => theme.palette.brand.terracotta[500],
                '& svg': { color: (theme) => theme.palette.brand.terracotta[500] },
              },
            }),
          }}
        >
          {/* Row 1: coupon label + value/credits */}
          <Stack sx={dropdownOptionStyles.couponContentStyles}>
            <TruncatedLabel
              tooltipTitle={label}
              isMobileSize={isMobileSize}
              sx={{
                gap: 0,
                letterSpacing: '-0.54px',
              }}
              endDecorator={
                upgradeLines.length > 0 ? (
                  <>
                    <Typography
                      level="caption2"
                      sx={{ color: 'inherit', flexShrink: 0, ...dropdownOptionStyles.addonTitleStyles }}
                    >
                      Upgrade
                    </Typography>
                    <InfoTooltip
                      title={
                        <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                          {upgradeLines.map((line, i) => (
                            <Typography component="li" level="caption2" key={i}>
                              {line}
                            </Typography>
                          ))}
                        </Stack>
                      }
                      disabled={disabled}
                    />
                  </>
                ) : null
              }
            >
              {label}
            </TruncatedLabel>
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
              <Link
                level="caption1"
                variant="primary"
                sx={
                  disabled
                    ? { pointerEvents: 'none', color: 'inherit', opacity: 0.6, textDecorationColor: 'inherit' }
                    : {}
                }
              >
                {type === CouponWalletOptionType.COUPON ? value : `Redeem ${cost} credits`}
              </Link>
              {unavailableReason && (
                <InfoTooltip title={unavailableReason} placement="top-end" size={20} noHighlight={disabled} />
              )}
            </Stack>
          </Stack>

          {/* Row 2: rule description + expiry */}
          <Stack justifyContent="center" alignItems="center" sx={{ flex: 'none', width: 110 }}>
            <Typography
              level="caption2"
              sx={{
                fontSize: 12,
                color: 'inherit',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {ruleDescription}. Expires: {expiredAt}
            </Typography>
          </Stack>
        </ListItemContent>
      </AutocompleteOption>
    </>
  );
}

export const CouponWalletAutocompleteOption = React.memo(CouponWalletAutocompleteOptionComponent);
