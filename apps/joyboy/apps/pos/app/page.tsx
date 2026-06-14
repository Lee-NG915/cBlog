'use client';
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Card, Typography, FormControl, Select, Option, Stack } from '@castlery/fortress';
import { ThemeProvider } from '@castlery/shared-components';
import { EcEnv, locales } from '@castlery/config';
import { minervaModern, poppins, aime, sanomatSans } from '@castlery/shared-next-font';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { sharedFeatureService } from '@castlery/shared-services';
import {
  PosUmsAccessDeniedModal,
  POS_UMS_REGION_BANNER_IMAGE,
  PosUmsSelectionScreen,
} from '@castlery/modules-user-components';

const enablePosUmsAuth = sharedFeatureService.enabledPosUmsAuth;
const posUmsRegionOrder = ['sg', 'au', 'ca', 'us', 'uk'];

function buildPosUmsRootUrl(callbackUrl?: string) {
  if (!callbackUrl) {
    return '/';
  }

  const searchParams = new URLSearchParams({
    callbackUrl,
  });

  return `/?${searchParams.toString()}`;
}

function buildPosUmsLoginUrl(region: string, callbackUrl?: string) {
  if (!callbackUrl) {
    return `/${region}/login`;
  }

  const searchParams = new URLSearchParams({
    callbackUrl,
  });

  return `/${region}/login?${searchParams.toString()}`;
}

function RootPageFallback() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
      }}
    />
  );
}

/**
 * This page component acts as a root-level page for locale redirection.
 * If the locale cookie isn't set, it redirects the user to the default one.
 * For the actual content, please visit the "app/[locale]/page.tsx" page component.
 */
function RootPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = makePersistenceHandles();
  const callbackUrl = searchParams?.get('callbackUrl') || undefined;
  const deniedRegion = searchParams?.get('deniedRegion') || '';
  const [deniedModalDismissed, setDeniedModalDismissed] = React.useState(false);
  const [changeRegion, setChangeRegion] = React.useState('');
  const deniedMarketLabel = React.useMemo(() => {
    return deniedRegion ? locales.find((locale) => locale.value === deniedRegion)?.label || '' : '';
  }, [deniedRegion]);

  const regionOptions = React.useMemo(() => {
    const localeMap = new Map(locales.map((item) => [item.value, item]));

    return posUmsRegionOrder
      .map((value) => localeMap.get(value))
      .filter((item): item is (typeof locales)[number] => Boolean(item));
  }, []);

  React.useEffect(() => {
    setDeniedModalDismissed(false);
  }, [deniedRegion]);

  const handleCloseDeniedModal = React.useCallback(async () => {
    setDeniedModalDismissed(true);
    await router.replace(buildPosUmsRootUrl(callbackUrl));
  }, [callbackUrl, router]);

  const handleSelectRegion = React.useCallback(
    async (region: string) => {
      setChangeRegion(region);
      await router.replace(buildPosUmsLoginUrl(region, callbackUrl));
    },
    [callbackUrl, router]
  );

  return (
    <>
      <PosUmsAccessDeniedModal
        deniedText={`Your account doesn't have access to POS_${deniedMarketLabel.replace(/\s+/g, '')}.`}
        open={Boolean(deniedRegion) && !deniedModalDismissed}
        onClose={() => {
          setChangeRegion('');
          void handleCloseDeniedModal();
        }}
      />
      {enablePosUmsAuth ? (
        <PosUmsSelectionScreen
          bannerImage={POS_UMS_REGION_BANNER_IMAGE}
          heroTitle="Castlery POS"
          title="Select Country"
          options={regionOptions.map(({ value, label }) => ({
            value,
            label,
            loading: changeRegion === value,
            disabled: Boolean(changeRegion && changeRegion !== value),
            onClick: async () => {
              await handleSelectRegion(value);
            },
          }))}
        />
      ) : (
        <form
          onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const region = formJson.region;
            const loggedIn = isLoggedIn.getItem();
            if (loggedIn === '1') {
              router.replace(`/${region}/discover`);
            } else {
              router.replace(`/${region}/login`);
            }
          }}
        >
          <Box
            sx={(theme) => ({
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
              padding: 1,
              bgcolor: theme.palette.brand.sage[500],
            })}
          >
            <Box
              sx={{
                padding: 1,
                backgroundColor: (theme) => theme.palette.brand.charcoal[0],
              }}
            >
              <Card>
                <Stack gap={4} width={{ xs: '280px', md: '492px' }}>
                  <Typography
                    level="h1"
                    sx={{
                      fontSize: 28,
                      color: (theme) => theme.palette.brand.charcoal[800],
                      textAlign: 'center',
                    }}
                  >
                    Select Region
                  </Typography>
                  <FormControl required>
                    <Typography
                      sx={{
                        color: (theme) => theme.palette.brand.charcoal[500],
                        marginBottom: 1,
                      }}
                    >
                      Region
                    </Typography>
                    <Select
                      name="region"
                      defaultValue={EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}
                      variant="borderplain"
                      slotProps={{
                        listbox: {
                          placement: 'bottom-start',
                          sx: { minWidth: 160 },
                        },
                      }}
                      sx={{
                        boxShadow: 'none',
                      }}
                    >
                      {locales.map(({ value, label }) => (
                        <Option key={value} value={value}>
                          {label}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                  <Button type="submit">Next</Button>
                </Stack>
              </Card>
            </Box>
          </Box>
        </form>
      )}
    </>
  );
}

export default function RootPage() {
  return (
    <html className={`${minervaModern.variable} ${poppins.variable} ${aime.variable} ${sanomatSans.variable}`}>
      <body>
        <ThemeProvider>
          <React.Suspense fallback={<RootPageFallback />}>
            <RootPageContent />
          </React.Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
