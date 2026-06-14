'use client';

import {
  useCartUndoActionMutation,
  selectRecordRemovedItem,
  selectShowRemoveUndoToast,
  updateShowRemoveUndoToast,
  selectRemoveUndoToastLoading,
} from '@castlery/modules-cart-domain';
import { Toast, IconButton, Typography, Link, CircularProgress, useBreakpoints } from '@castlery/fortress';
import { CheckCircleFilled, Close } from '@castlery/fortress/Icons';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { useState } from 'react';
import { LineItemSchema } from '@castlery/types';

export function RemoveUndoToast() {
  const { mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const item = useAppSelector(selectRecordRemovedItem);
  const show = useAppSelector(selectShowRemoveUndoToast);
  const loading = useAppSelector(selectRemoveUndoToastLoading);
  const [activeUndoItemId, setActiveUndoItemId] = useState<LineItemSchema['id']>();
  const [undoTrigger] = useCartUndoActionMutation();

  const isUndoing = loading && activeUndoItemId === item?.id;

  const handleCloseToast = async () => {
    dispatch(updateShowRemoveUndoToast(false));
  };

  const handleUndo = async () => {
    if (!item) return;
    setActiveUndoItemId(item.id);
    await undoTrigger({ lineItemId: item.id });
  };

  return (
    <Toast
      theme="dark"
      open={show}
      anchorOrigin={{ vertical: mobile ? 'top' : 'bottom', horizontal: 'center' }}
      autoHideDuration={5000}
      onClose={handleCloseToast}
      startDecorator={<CheckCircleFilled />}
      endDecorator={
        <IconButton
          onClick={handleCloseToast}
          sx={{ color: 'inherit', width: 24, height: 24, minHeight: 24, minWidth: 24 }}
        >
          <Close sx={{ color: 'inherit' }} />
        </IconButton>
      }
      sx={{
        minWidth: mobile ? 300 : 400,
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Typography level="body1" sx={{ color: 'inherit' }}>
        {item?.variant?.name} has been removed.
      </Typography>
      <Link
        level="body1"
        component={'button'}
        onClick={handleUndo}
        sx={{
          color: 'white',
          textDecorationColor: 'white',
          '&:hover': {
            color: 'white',
          },
        }}
      >
        {isUndoing ? <CircularProgress sx={{ color: 'white' }} size={'md'} /> : 'Undo'}
      </Link>
    </Toast>
  );
}

export default RemoveUndoToast;
