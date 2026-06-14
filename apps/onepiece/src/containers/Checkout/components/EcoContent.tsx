import React from 'react';
import { Box, Typography, Link, IconButton } from '@castlery/fortress';
import ReactPicture from 'components/ReactPicture';
import { Close } from '@castlery/fortress/Icons';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { ECO_DELIVERY_CONFIG } from './config';

interface EcoDetailProps {
  close: () => void;
}
const EcoDetail: React.FC<EcoDetailProps> = ({ close }) => {
  const { mobile } = useBreakpoints();

  return (
    <Box
      sx={{
        backgroundColor: '#FBF9F4',
        height: '100%',
        boxSizing: 'border-box',
        paddingY: '48px',
        paddingX: !mobile ? '56px' : '24px',
        overflowY: 'auto',
        '--fortress-fontFamily-body': 'Aime',
        '--fortress-fontFamily-display': 'Aime',
        fontFamily: 'Aime !important',
      }}
    >
      <IconButton sx={{ position: 'absolute', top: '16px', right: '16px', color: '#3C101E' }} onClick={close}>
        <Close />
      </IconButton>
      {ECO_DELIVERY_CONFIG.contents.map((item, index) => (
        <React.Fragment key={`${item.type}_${index}`}>
          <Typography
            level={item.type === 'main' ? (mobile ? 'h2' : 'h3') : 'subh1'}
            sx={item.type === 'main' ? { mb: 4, color: '#3C101E' } : { mt: 3, mb: 2, color: '#3C101E' }}
          >
            {item.title}
          </Typography>
          <Typography level="body2" sx={{ color: '#3C101E' }}>
            {item.description}
          </Typography>
        </React.Fragment>
      ))}
      <Box sx={{ mt: 4, mb: 1 }}>
        <ReactPicture srcset={ECO_DELIVERY_CONFIG.imageUrl} alt="Eco Delivery 2.0 image" lazy={false} />
      </Box>

      <Typography sx={{ fontSize: '12px', color: '#3C101E' }}>{ECO_DELIVERY_CONFIG.tip}</Typography>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link
          underline="always"
          href={ECO_DELIVERY_CONFIG.link.href}
          target="_blank"
          level="body2"
          role="link"
          aria-label={ECO_DELIVERY_CONFIG.link.text} // ARIA => https://www.w3.org/WAI/ARIA/apg/patterns/link/examples/link/
          sx={{
            color: '#D25C1B',
            textDecorationColor: '#D25C1B',
            '&:hover': {
              color: '#BF5419',
              textDecorationColor: '#BF5419',
              textDecoration: 'underline',
            },
            '&:active': {
              color: '#74330F',
              textDecorationColor: '#74330F',
              textDecoration: 'underline',
            },
          }}
        >
          {ECO_DELIVERY_CONFIG.link.text}
        </Link>
      </Box>
    </Box>
  );
};

export default React.memo(EcoDetail);
