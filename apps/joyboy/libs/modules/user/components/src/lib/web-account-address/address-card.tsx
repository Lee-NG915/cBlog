'use client';

import { Box, Typography, Card, CardContent, IconButton, useBreakpoints } from '@castlery/fortress';
import { CustomerAddressEntity } from '@castlery/types';
import { Delete } from '@castlery/fortress/Icons';
import { accessInSG, showApartmentBeforeStreet } from '@castlery/config';

export function AddressCard({
  addressInfo,
  onDelete,
}: // onEdit,
{
  addressInfo: CustomerAddressEntity;
  onDelete: (address: CustomerAddressEntity) => void;
  // onEdit: (address: CustomerAddressEntity) => void;
}) {
  const { mobile, tablet, desktop } = useBreakpoints();

  let addressLine1String = accessInSG
    ? addressInfo.address1
    : `${addressInfo.building_name ? `${addressInfo.building_name}, ` : ''}${addressInfo.address1}`;
  const addressLine2String = accessInSG ? addressInfo.address2 || addressInfo.building_name : addressInfo.address2;

  // for old address data
  if (accessInSG && !addressInfo.address1) {
    addressLine1String = `${addressInfo.street_number ? `${addressInfo.street_number} ` : ''}${
      addressInfo.street || ''
    }${
      addressInfo.flat || addressInfo.level
        ? `, #${addressInfo.level || ''}${addressInfo.flat ? `-${addressInfo.flat}` : ''}`
        : ''
    }`;
  }

  return (
    <Card
      variant="outlined"
      sx={{
        '--Card-padding': mobile ? '16px' : '24px',
        '--variant-outlinedBorder': '0.5px solid var(--fortress-palette-brand-mono-300)',
        '--Card-radius': 0,
        width: {
          xs: '342px',
          sm: '352px',
          md: '472px',
        },
        minHeight: {
          xs: '134px',
          sm: '162px',
          md: '162px',
        },
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Box
          sx={{
            width: {
              xs: '278px',
              sm: '264px',
              md: '384px',
            },
          }}
        >
          <Typography level="caption1">
            {addressInfo.firstname} {addressInfo.lastname} <br />
            {addressInfo.company && <Box>{addressInfo.company}</Box>}
            {showApartmentBeforeStreet ? (
              <>
                {addressLine2String && <Box>{addressLine2String}</Box>}
                <Box>{addressLine1String}</Box>
              </>
            ) : (
              <>
                <Box>{addressLine1String}</Box>
                {addressLine2String && <Box>{addressLine2String}</Box>}
              </>
            )}
            <Box>
              {accessInSG
                ? `${addressInfo.country}, ${addressInfo.zipcode}`
                : `${addressInfo.city}, ${addressInfo.state_name} ${addressInfo.zipcode}`}
            </Box>
            <Box>{addressInfo.phone}</Box>
          </Typography>
        </Box>
        <IconButton
          sx={{
            width: '24px',
            height: '24px',
            color: 'var(--fortress-palette-neutral-500)',
          }}
          aria-label="Delete address"
          onClick={() => onDelete(addressInfo)}
        >
          <Delete />
        </IconButton>
      </CardContent>
    </Card>
  );
}
