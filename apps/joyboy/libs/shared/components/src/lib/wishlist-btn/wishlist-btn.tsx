'use client';

import { RadioGroup, RadioIcon, Toast, Typography, useBreakpoints } from '@castlery/fortress';
import { CheckCircleFilled, Close, Favorite } from '@castlery/fortress/Icons';
import { addWishlist, deleteWishlist, getWishListSelect, selectedWishList } from '@castlery/modules-user-domain';
import { CustomLink } from '../custom-link/custom-link';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useMemo, useState } from 'react';

interface WishlistToastProps {
  open: boolean;
  onClose: () => void;
  status: 'add' | 'remove';
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}
/**
 *  正常来说 这里应该使用 portal 的思路来处理 但是做Nextjs 的组件 使用 portal 会有点问题
 * @param param0
 * @returns
 */
const WishlistToast = ({ open, onClose, status, anchorOrigin }: WishlistToastProps) => {
  const { desktop, mobile } = useBreakpoints();

  return (
    <Toast
      open={open}
      onClose={onClose}
      theme="dark"
      anchorOrigin={
        anchorOrigin || {
          vertical: desktop ? 'top' : 'bottom',
          horizontal: mobile ? 'center' : 'right',
        }
      }
      sx={{
        // 确保 Toast 不受父容器的 opacity 影响
        position: 'fixed',
        zIndex: 9999,
      }}
      startDecorator={<CheckCircleFilled />}
      endDecorator={
        <Close
          onClick={onClose}
          sx={{
            cursor: 'pointer',
          }}
        />
      }
      actionSlot={
        status === 'remove' ? null : (
          <CustomLink linkKey="wishlist">
            <Typography
              level="body1"
              sx={{
                color: 'var(--fortress-palette-brand-warmLinen-500)',
                textDecoration: 'underline',
              }}
            >
              View Wishlist
            </Typography>
          </CustomLink>
        )
      }
    >
      <Typography
        level="body1"
        sx={(theme) => ({
          color: theme.palette.brand.warmLinen[500],
        })}
      >
        {status === 'remove' ? 'Removed from wishlist!' : 'Added to wishlist!'}
      </Typography>
    </Toast>
  );
};

// 导出 WishlistToast 组件供其他地方使用
export { WishlistToast };

interface WishlistBtnProps {
  variantId?: number;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  onToastShow?: (status: 'add' | 'remove') => void;
  showToast?: boolean;
}

export const WishlistBtn = (props: WishlistBtnProps) => {
  const { variantId, anchorOrigin, onToastShow, showToast = true } = props;
  const dispatch = useAppDispatch();
  const currentWishListData = useAppSelector(selectedWishList);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastStatus, setToastStatus] = useState<'add' | 'remove'>('add');

  // 使用与 FavoriteButton 相同的 loading 状态
  const { isLoading: isWishListLoading } = useAppSelector(getWishListSelect());

  const isLoading = isWishListLoading || !variantId || toggleLoading;

  // const { isLoading: theLookWishListIsLoading } = useAppSelector(getTheLookWishListSelect());

  const liked = useMemo(() => {
    return currentWishListData.findIndex((item) => item.id === variantId) > -1;
  }, [currentWishListData, variantId]);

  const handleToastOpen = (status: 'add' | 'remove') => {
    if (onToastShow) {
      onToastShow(status);
    } else {
      setToastStatus(status);
      setToastOpen(true);
    }
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    // 防止事件冒泡，避免触发父级的点击事件（如产品卡片的路由跳转）
    e.preventDefault();
    e.stopPropagation();

    if (isLoading || !variantId) return;
    setToggleLoading(true);
    try {
      if (liked) {
        await dispatch(deleteWishlist.initiate(variantId.toString()));
        handleToastOpen('remove');
      } else {
        await dispatch(addWishlist.initiate(variantId.toString()));
        handleToastOpen('add');
      }
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <>
      <RadioGroup
        value={liked ? 'liked' : ''}
        name="product-like"
        orientation="horizontal"
        onClick={handleLikeToggle}
        // onMouseDown={handleLikeToggle}
        aria-label="Wishlist actions"
      >
        <RadioIcon
          value="liked"
          variant="outlined"
          overlay
          uncheckedIcon={<Favorite />}
          checkedIcon={<Favorite />}
          disabled={isLoading}
          slotProps={{
            input: {
              'aria-label': liked ? 'Remove from wishlist' : 'Add to wishlist',
              'aria-describedby': 'wishlist-status',
              'data-insights-symbol': 'wishlist_btn',
            },
          }}
        />
      </RadioGroup>
      {/* 隐藏的状态描述，用于屏幕阅读器 */}
      <span
        id="wishlist-status"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {liked ? 'Item is in wishlist' : 'Item is not in wishlist'}
      </span>
      {/* Live region for announcing actions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
        key={`${liked}-${isLoading}`}
      >
        {isLoading ? 'Updating wishlist...' : ''}
      </div>
      {showToast && (
        <WishlistToast open={toastOpen} onClose={handleToastClose} status={toastStatus} anchorOrigin={anchorOrigin} />
      )}
    </>
  );
};
