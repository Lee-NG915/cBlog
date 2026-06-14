'use client';

import { Typography } from '@castlery/fortress';
import { userFeatureService } from '@castlery/modules-user-services';
import type { Address } from '@castlery/modules-user-domain';

export const AddressCardContent = ({ address }: { address: Address }) => {
  const showApartmentBeforeStreet = userFeatureService.getUserAddressFeatures().showApartmentBeforeStreet;

  return (
    <>
      <Typography level="caption1">{`${address.firstname} ${address.lastname}`} </Typography>
      <Typography level="caption1">{address.company}</Typography>
      {showApartmentBeforeStreet ? (
        <>
          <Typography level="caption1">{address.address2}</Typography>
          <Typography level="caption1">{address.address1}</Typography>
        </>
      ) : (
        <>
          <Typography level="caption1">{address.address1}</Typography>
          <Typography level="caption1">{address.address2}</Typography>
        </>
      )}
      <Typography level="caption1">{address.building_name}</Typography>
      <Typography level="caption1">{`${address.city}, ${address.state_name || ''} ${address.zipcode}`} </Typography>
      <Typography level="caption1">{`${address.phone}`} </Typography>
    </>
  );
};
