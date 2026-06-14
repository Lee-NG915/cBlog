import type { GiftPoolGiftItemWithVariantSchema } from '@castlery/types';

export interface CollapsibleContentProps {
  isOpen: boolean;
  gifts: GiftPoolGiftItemWithVariantSchema[];
  mobileLayout?: boolean;
  curCode?: string;
}

export interface GiftHeaderProps {
  isChangeGift: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onChangeClose?: () => void;
  mobileLayout?: boolean;
}

export interface FreeGiftProps {
  fullCart?: boolean;
  onRemoveFreeGift?: () => void;
  onChangeClose?: () => void;
  changeGiftId?: string;
}
