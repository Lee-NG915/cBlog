'use client';
import React from 'react';
import { Typography } from '@castlery/fortress';
import { CustomerAddressEntity_V2 } from '@castlery/types';

export interface AddressDisplayCardContentProps {
  address: CustomerAddressEntity_V2;
  children?: React.ReactNode;
}

const singleLineEllipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const multiLineEllipsis = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%',
} as const;

export const AddressDisplayCardContent: React.FC<AddressDisplayCardContentProps> = ({ address, children }) => {
  if (!address) {
    return null;
  }
  return (
    <>
      <Typography level="caption1" sx={singleLineEllipsis}>
        {address.firstname} {address.lastname}
      </Typography>
      <Typography level="caption1" sx={singleLineEllipsis}>
        {address.company ?? ''}
      </Typography>
      <Typography level="caption1" sx={multiLineEllipsis}>
        {address.address1}
      </Typography>
      <Typography level="caption1" sx={multiLineEllipsis}>
        {address.address2}
      </Typography>
      {/* {address.buildingName && <Typography level="caption1">{address.buildingName}</Typography>} */}
      <Typography level="caption1" sx={singleLineEllipsis}>
        {address.city ? `${address.city}, ` : ''}
        {address.stateName ? `${address.stateName} ` : ''}
        {address.zipcode}
      </Typography>
      <Typography level="caption1" sx={singleLineEllipsis}>
        {address.phone}
        {address.alternativePhone ? ` / ${address.alternativePhone}` : ''}
      </Typography>
      {children}
    </>
  );
};
