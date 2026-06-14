import { Link, Stack, Typography } from '@castlery/fortress';
import { FacebookOutline, InstagramOutline, TiktokOutline, PinterestOutline } from '@castlery/fortress/Icons';
import { SocialItemProps } from '../../footer';

type SocialProps = {
  socialMap: SocialItemProps[];
};

const renderIcon = (icon: string) => {
  switch (icon) {
    case 'facebook':
      return <FacebookOutline sx={(theme) => ({ width: theme.spacing(8), height: theme.spacing(8) })} key="Facebook" />;
    case 'instagram':
      return (
        <InstagramOutline sx={(theme) => ({ width: theme.spacing(8), height: theme.spacing(8) })} key="Instagram" />
      );
    case 'pinterest':
      return (
        <PinterestOutline sx={(theme) => ({ width: theme.spacing(8), height: theme.spacing(8) })} key="Pinterest" />
      );
    case 'tiktok':
      return <TiktokOutline sx={(theme) => ({ width: theme.spacing(8), height: theme.spacing(8) })} key="Tiktok" />;
    default:
      return null;
  }
};

const Social = ({ socialMap }: SocialProps) => {
  return (
    <Stack spacing={2}>
      <Typography
        level="h5"
        sx={{
          fontWeight: '400 !important',
          fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
        }}
      >
        Social
      </Typography>
      <Stack direction="row" spacing={4}>
        {socialMap.map((item, index) => {
          const { ariaLabel, link, icon } = item;
          return (
            <Link
              key={index}
              aria-label={ariaLabel}
              target="_blank"
              rel="noopener"
              href={link}
              sx={(theme) => ({
                width: 32,
                height: 32,
                // border: '1px solid',
                // borderColor: theme.palette.brand.charcoal[10],
                color: theme.palette.brand.charcoal[10],
                bgcolor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ':hover': {
                  color: theme.palette.brand.charcoal[10],
                },
              })}
            >
              {renderIcon(icon)}
            </Link>
          );
        })}
      </Stack>
      <Typography level="caption2">#AtHomewithCastlery</Typography>
    </Stack>
  );
};

export default Social;
