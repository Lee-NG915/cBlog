'use client';
import React, { useState } from 'react';
import { AddAccount } from '@castlery/fortress/Icons';
import { Drawer, IconButton } from '@castlery/fortress';
import { PosSelectCustomerContent } from '../pos-select-customer/pos-select-customer';

/* eslint-disable-next-line */
export interface CreateAUserProps {}

export function CreateAUser(props: CreateAUserProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton
        onClick={() => {
          setOpen(true);
        }}
      >
        <AddAccount />
      </IconButton>
      <Drawer
        open={open}
        showCloseButton
        onClose={() => {
          setOpen(false);
        }}
      >
        <PosSelectCustomerContent
          afterChangedCustomer={() => {
            setOpen(false);
          }}
        />
      </Drawer>
    </>
  );
}
