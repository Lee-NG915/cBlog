import { Card, IconButton, Typography } from '@castlery/fortress';
import { Edit, Plus } from '@castlery/fortress/Icons';
import type { Address } from '@castlery/modules-user-domain';
import { AddressCardContent } from './address-card-content';

const NewAddressCard = () => {
  return (
    <Card
      sx={{
        p: 2,
        gap: 0,
      }}
    >
      <Typography startDecorator={<Plus />}>Add New Address</Typography>
    </Card>
  );
};
export const ExistingAddressCard = ({ address, clickHandler }: { address: Address; clickHandler?: () => void }) => {
  const onClick = () => {
    if (typeof clickHandler === 'function') {
      clickHandler();
    }
    return false;
  };
  return (
    <Card
      role="button"
      sx={{
        gap: 0,
        p: 3,
        width: '100%',
        height: 'inherit',
        flexDirection: 'column',
        alignItems: 'flex-start',
        cursor: 'pointer',
        '&>span': { textAlign: 'left' },
      }}
      onClick={onClick}
    >
      <AddressCardContent address={address} />
      <IconButton
        variant="outlined"
        color="neutral"
        sx={(theme) => ({
          position: 'absolute',
          top: -1,
          right: -1,
        })}
      >
        <Edit />
      </IconButton>
    </Card>
  );
};

export interface AddressProps {
  address?: Address;
  loading?: boolean;
}

export function AddressCard(props: AddressProps) {
  const { address, loading = false } = props;
  if (!address) {
    return <NewAddressCard />;
  }
  return <ExistingAddressCard address={address} loading={loading} />;
}
