'use client';
import { AutocompleteOption, type AutocompleteOptionProps } from '@castlery/fortress';
import { checkEligible, type CouponItemType } from './helperV2';
import { CouponOptionItemV2 } from '../coupon-option-item/coupon-option-itemV2';

export interface CouponDropdownOptionProps extends AutocompleteOptionProps {
  disabled?: boolean;
  children: React.ReactNode;
}
export const CouponDropdownOptionV2 = ({ disabled = false, children, ...rest }: CouponDropdownOptionProps) => {
  return (
    <AutocompleteOption
      {...rest}
      sx={{
        border: 'none',
        paddingX: 2,
        paddingY: 1.5,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 0.5,
        '&:not(:last-child)': {
          borderBottom: (theme) => `1px solid ${theme.palette.brand.charcoal[300]}`,
        },
        // 重要：为 disabled 选项重新启用 pointer events 以支持 tooltip 交互
        '&.MuiAutocompleteOption-root[aria-disabled="true"]': {
          pointerEvents: 'auto',
          cursor: 'default',
        },
      }}
    >
      {children}
    </AutocompleteOption>
  );
};

export const renderOptionV2 = (props: object, option: CouponItemType, state: object) => {
  const eligible = checkEligible({ available: option.available, expired_at: option.expired_at });
  return (
    <CouponDropdownOptionV2 {...props} disabled={!eligible}>
      <CouponOptionItemV2 coupon={option} disabled={!eligible} />
    </CouponDropdownOptionV2>
  );
};
