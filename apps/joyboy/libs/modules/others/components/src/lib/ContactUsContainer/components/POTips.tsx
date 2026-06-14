'use client';

import { NiceModal, Stack } from '@castlery/fortress';
import { Info } from '@castlery/fortress/Icons';
import { FortressImage } from '@castlery/shared-components';
import React, { useState } from 'react';

const POTips = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Info
        onClick={() => setOpen(true)}
        sx={(theme) => ({ width: theme.spacing(6), height: theme.spacing(6), cursor: 'pointer' })}
      />
      <NiceModal
        dialogSx={{ backgroundColor: '#FBF9F4' }}
        open={open}
        onClose={() => setOpen(false)}
        showCancelBtn={false}
        showConfirmBtn={false}
      >
        <Stack alignItems="center">
          <FortressImage
            imageWidth={220}
            imageHeight={140}
            src="https://res.cloudinary.com/castlery/image/upload/v1605710427/static/contact-us/po_number.jpg"
            alt="PO Number"
          />
        </Stack>
      </NiceModal>
    </>
  );
};

export { POTips };
