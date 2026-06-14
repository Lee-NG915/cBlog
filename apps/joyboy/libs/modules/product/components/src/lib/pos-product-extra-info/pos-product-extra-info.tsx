'use client';

import { useState } from 'react';
import { Stack, Typography } from '@castlery/fortress';
import { Check, ChevronDown, Duplicate } from '@castlery/fortress/Icons';
import { LeadTimeShippingFee, Variant } from '@castlery/modules-product-domain';

const ExtraInfoItem = ({ label, value, needCopy = false }: { label: string; value: string; needCopy?: boolean }) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <Stack>
      <Stack direction="row" gap={1} alignItems="center">
        <Typography
          level="caption1"
          sx={(theme) => ({
            color: theme.palette.brand.mono[700],
            fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
            fontWeight: 700,
          })}
        >
          {label}
        </Typography>
        {needCopy && (
          <Stack sx={{ position: 'relative', display: 'inline-flex' }}>
            {isCopied && (
              <Stack
                sx={(theme) => ({
                  position: 'absolute',
                  left: '50%',
                  top: -52,
                  transform: 'translateX(-50%)',
                  zIndex: 1,
                  alignItems: 'center',
                  pointerEvents: 'none',
                })}
              >
                <Stack
                  sx={(theme) => ({
                    padding: theme.spacing(1, 1.5),
                    backgroundColor: theme.palette.brand.warmLinen[500],
                    boxShadow: theme.shadow.md,
                  })}
                >
                  <Typography
                    level="caption1"
                    sx={(theme) => ({
                      color: theme.palette.brand.mono[900],
                      fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                    })}
                  >
                    Copied
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid #F6F3E7',
                    marginTop: '-1px',
                  }}
                />
              </Stack>
            )}
            <Duplicate
              color="#616161"
              sx={{
                width: 20,
                height: 20,
                cursor: 'pointer',
              }}
              onClick={() => {
                if (navigator?.clipboard) {
                  navigator.clipboard.writeText(value);
                  setIsCopied(true);
                  setTimeout(() => {
                    setIsCopied(false);
                  }, 1000);
                }
              }}
            />
          </Stack>
        )}
      </Stack>
      <Typography
        level="caption1"
        sx={(theme) => ({
          color: theme.palette.brand.mono[700],
          fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
        })}
      >
        {value}
      </Typography>
    </Stack>
  );
};

const PosProductExtraInfo = ({
  variant,
  leadtimeShippingFee,
}: {
  variant: Variant;
  leadtimeShippingFee: LeadTimeShippingFee;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Stack
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        paddingTop: theme.spacing(2),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: theme.spacing(4),
      })}
    >
      {!isExpanded && (
        <Stack
          sx={{ width: '100%' }}
          display="flex"
          flexDirection="row"
          gap={4}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Typography
            level="caption1"
            sx={(theme) => ({
              color: theme.palette.brand.mono[700],
              fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              fontWeight: 700,
            })}
          >
            Units left: {leadtimeShippingFee?.units_left ?? 'N/A'}
          </Typography>
          <Typography
            level="caption1"
            sx={(theme) => ({
              color: theme.palette.brand.mono[700],
              fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              fontWeight: 700,
            })}
          >
            EOL: {leadtimeShippingFee?.eol_date || 'N/A'}
          </Typography>
        </Stack>
      )}
      <ChevronDown
        onClick={handleToggle}
        sx={{
          width: 20,
          height: 20,
          cursor: 'pointer',
          position: 'absolute',
          right: 0,
          top: 16,
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease-in-out',
        }}
      />
      {isExpanded && (
        <Stack display="flex" flexDirection="row" gap={4} alignItems="center">
          <ExtraInfoItem label="SKU Code" value={variant?.sku} needCopy />
          <ExtraInfoItem label="EOL Date" value={leadtimeShippingFee?.eol_date || 'N/A'} />
          <ExtraInfoItem label="Replacement" value={leadtimeShippingFee?.next_version_sku || 'N/A'} needCopy />
        </Stack>
      )}
    </Stack>
  );
};

export { PosProductExtraInfo };
