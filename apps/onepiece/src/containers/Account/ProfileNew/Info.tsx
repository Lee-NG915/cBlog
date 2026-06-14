import React from 'react';
import { Box, Typography } from '@castlery/fortress';

interface InfoItemProps {
  fieldKey: string;
  label: string;
  value: string;
  tips?: string;
}
const InfoItem: React.FC<InfoItemProps> = ({ label, value, fieldKey, tips }) => {
  return (
    <Box sx={{ marginBottom: (theme) => theme.spacing(2) }}>
      <Typography sx={{ color: 'var(--fortress-palette-brand-charcoal-500)' }}>{label}</Typography>
      {fieldKey === 'password' ? (
        <Typography
          sx={{ fontSize: 24, height: 28, lineHeight: '28px', letterSpacing: (theme) => theme.spacing(-0.5) }}
        >
          ●●●●●●●●
        </Typography>
      ) : (
        <Typography>{value || '-'}</Typography>
      )}
      {tips && (
        <Typography
          sx={{
            fontSize: '14px',
            color: (theme) => theme.palette.brand.charcoal[800],
          }}
        >
          {tips}
        </Typography>
      )}
    </Box>
  );
};

const Info: React.FC<{ list: InfoItemProps[] }> = ({ list }) => (
  <>
    {list?.map((item) => (
      <InfoItem key={item.fieldKey} {...item} />
    ))}
  </>
);

export default Info;
