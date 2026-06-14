'use client';

import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { Typography, Stack, WebLOGO, useBreakpoints } from '@castlery/fortress';
import { NextFortressLink } from '@castlery/shared-components';
import { RightArrow } from '@castlery/fortress/Icons';
import { EcEnv } from '@castlery/config';
import { useEffect, useState } from 'react';
import { logger } from '@castlery/observability/client';

const SelectLink = ({
  href,
  text,
  value,
  isFirst = false,
}: {
  href: string;
  text: string;
  value: string;
  isFirst?: boolean;
}) => {
  const { desktop } = useBreakpoints();

  return (
    <NextFortressLink
      className="select-link"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: desktop ? '16px' : '20px',
        height: desktop ? '104px' : '56px',
        position: 'relative',
        '&:hover': {
          textDecoration: 'none',
          span: {
            color: '#BF5419',
          },
          '& .arrow-icon': {
            opacity: 1,
          },
        },
      }}
      href={href}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        makePersistenceHandles().castleryShop.setItem(value);
        window.location.href = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}${href}`;
      }}
    >
      <Typography
        sx={{
          fontSize: {
            xs: '40px',
            sm: '40px',
            md: '40px',
            lg: '40px',
            xl: '80px',
          },
          color: isFirst ? '#BF5419' : '#3C101E',
          fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
        }}
      >
        {text}
      </Typography>
      <RightArrow
        className="arrow-icon"
        sx={{
          opacity: isFirst ? 1 : 0,
          width: {
            xs: '40px',
            sm: '40px',
            md: '40px',
            lg: '40px',
            xl: '80px',
          },
          height: {
            xs: '40px',
            sm: '40px',
            md: '40px',
            lg: '40px',
            xl: '80px',
          },
          color: '#BF5419',
        }}
      />
    </NextFortressLink>
  );
};

export function CountrySelectPageClient({
  links,
  CC,
}: {
  links: { href: string; text: string; value: string }[];
  CC: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    try {
      window.setTimeout(() => {
        const webCountryCode = makePersistenceHandles().webCountryCode.getItem();
        if (webCountryCode) {
          const countryCodes = links.map((link) => link.value.toLocaleUpperCase());
          const findCountry = countryCodes.findIndex((code) => code === webCountryCode);
          if (findCountry !== -1) {
            links.unshift(...links.splice(findCountry, 1));
            logger.info('Country selection reordered based on stored preference', {
              webCountryCode,
              reorderedIndex: findCountry,
              context: 'country_select',
            });
          }
        }
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      logger.error('Failed to retrieve or apply country code preference', {
        error: error instanceof Error ? error.message : String(error),
        context: 'country_select',
      });
      setIsLoading(false);
    }
  }, []);
  const { desktop } = useBreakpoints();
  if (isLoading) {
    return null;
  }
  if (!desktop) {
    return (
      <Stack sx={{ background: 'var(--fortress-palette-brand-warmLinen-500)', height: '100vh' }}>
        <Stack
          sx={{
            padding: '16px 0',
          }}
        >
          <WebLOGO usedInMobile={true} />
        </Stack>
        <Stack
          sx={{
            width: '100%',
            height: '100%',
            backgroundImage:
              'url("https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1639972555/static/home/countrySelector/country-selector-mobile.jpg")',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <Stack
          sx={{
            width: '100%',
            padding: '32px 24px',
          }}
        >
          <Typography
            level="h4"
            sx={{
              fontSize: '18px',
              fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              mb: '16px',
            }}
          >
            Choose your local site to shop{CC}
          </Typography>
          <Stack>
            {links.map(({ href, text, value }, index) => (
              <SelectLink key={href} href={href} text={text} value={value} isFirst={index === 0} />
            ))}
          </Stack>
        </Stack>
      </Stack>
    );
  }
  return (
    <Stack
      sx={{
        background: 'var(--fortress-palette-brand-warmLinen-500)',
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Stack
        sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          right: 0,
          backgroundImage:
            'url("https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1639972557/static/home/countrySelector/country-selector-desktop.jpg")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <Stack
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          right: '50%',
          height: '100%',
          justifyContent: 'space-between',
          background: 'var(--fortress-palette-brand-warmLinen-500)',
          padding: '32px 60px 123px 60px',
        }}
      >
        <WebLOGO />
        <Stack>
          <Typography
            level="h4"
            sx={{
              mb: '12px',
              fontSize: '24px',
              fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
            }}
          >
            Choose your local site to shop code: {CC}
          </Typography>
          <Stack
            sx={{
              '&:hover .select-link:not(:hover)': {
                '& .arrow-icon': {
                  opacity: 0,
                  transform: 'translateX(-10px)',
                },
                '& span': {
                  color: '#3C101E !important',
                },
              },
            }}
          >
            {links.map(({ href, text, value }, index) => (
              <SelectLink key={href} href={href} text={text} value={value} isFirst={index === 0} />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
