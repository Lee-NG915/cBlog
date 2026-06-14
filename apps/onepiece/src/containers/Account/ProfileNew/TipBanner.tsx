import Card from '@mui/joy/Card';
import CardCover from '@mui/joy/CardCover';
import React from 'react';
import ReactPicture from 'components/ReactPicture';
import CardContent from '@mui/joy/CardContent';
import { Typography, Box } from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { withUseBreakpoints } from 'utils/page';

interface TipBannerProps {
  onGo: () => void;
  breakpoints: { mobile: boolean; tablet: boolean; md: boolean };
}
const TipBanner: React.FC<TipBannerProps> = ({ onGo, breakpoints }) => {
  const { mobile: isMobile, md } = breakpoints;

  return (
    <Card
      sx={{
        height: isMobile ? 101 : 141,
        marginX: (theme) => (isMobile || md ? theme.spacing(-2) : theme.spacing(-4)),
        marginBottom: (theme) => theme.spacing(4),
        cursor: 'pointer',
      }}
      onClick={onGo}
    >
      <CardCover>
        <ReactPicture
          srcset="https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1660616132/static/review/review-us-desktop.png"
          alt="banner"
          loader={{
            height: isMobile ? '101px' : '146px',
            sizes: isMobile ? ['1'] : ['0.5'],
          }}
          lazy={false}
          objectFit="cover"
        />
      </CardCover>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography
          level="h1"
          sx={{
            fontSize: isMobile ? '24px' : '28px',
            textAlign: 'center',
            color: 'var(--fortress-palette-brand-flour-10)',
            marginBottom: (theme) => theme.spacing(1),
          }}
        >
          Get Rewarded
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-flour-10)' }}>
            Complete your profile to earn 20 credits!
          </Typography>
          <ArrowRight
            sx={{
              marginLeft: (theme) => theme.spacing(2),
              display: 'block',
              width: isMobile ? 24 : 32,
              height: isMobile ? 24 : 32,
              marginY: 'auto',
              color: 'var(--fortress-palette-brand-flour-10)',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default withUseBreakpoints(TipBanner);
