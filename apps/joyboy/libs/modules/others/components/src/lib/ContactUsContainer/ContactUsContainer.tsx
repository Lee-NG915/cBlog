'use client';

import { Container, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { FormFieldProps, GeneralBreadcrumbs, SimpleForm } from '@castlery/shared-components';
import { HeadBanner } from '../HeadBanner';
import { ContactInfo } from './components/ContactInfo';
import { EcEnv } from '@castlery/config';
import { formFieldsByMarket } from './config/config';

const ContactUsContainer = () => {
  const { desktop } = useBreakpoints();
  return (
    <Container sx={{ ...(!desktop && { padding: '0 !important' }) }}>
      <Stack>
        <GeneralBreadcrumbs
          breadcrumbs={[
            {
              label: 'Contact Us',
              link: '/contact-us',
            },
          ]}
        />
        <HeadBanner
          header="Contact Us"
          description={
            desktop
              ? 'No problem is too big or small. Send your questions our way.'
              : "Whether you have questions about our products, payments, delivery or returns, please don't hesitate to get in touch with us"
          }
          image={{
            desktop_url:
              'https://res.cloudinary.com/castlery/image/upload/v1779936818/hardcode%20pages/contact_us_desktop.jpg',
            tablet_url:
              'https://res.cloudinary.com/castlery/image/upload/v1779936810/hardcode%20pages/contact_us_mobile.jpg',
            mobile_url:
              'https://res.cloudinary.com/castlery/image/upload/v1779936810/hardcode%20pages/contact_us_mobile.jpg',
            alt: 'Contact Us Banner',
          }}
        />
        <ContactInfo />
        {['US', 'CA', 'UK'].includes(EcEnv.NEXT_PUBLIC_COUNTRY) && (
          <Stack
            sx={(theme) => ({
              width: '100%',
              alignItems: 'center',
              mb: theme.spacing(10),
              ...(!desktop && { padding: `0 ${theme.spacing(6)}` }),
            })}
          >
            <Typography
              level="caption1"
              sx={(theme) => ({
                color: theme.palette.brand.mono[700],
                textAlign: 'center',
                maxWidth: theme.spacing(200),
              })}
            >
              By texting us, you consent to receive text messages from Castlery at the mobile number you use to text and
              you are opting-in to receive future messages or a phone call in the number you provided. Message & Data
              rates may apply. View our Terms and Privacy Policy for more information.
            </Typography>
          </Stack>
        )}
        <SimpleForm
          title="Need More Assistance?"
          description={'Email us via this form. We generally respond within 3 business days.'}
          columns={formFieldsByMarket[EcEnv.NEXT_PUBLIC_COUNTRY]}
          submitUrl="/contacts"
          // extraTips={true}
        />
      </Stack>
    </Container>
  );
};

export { ContactUsContainer };
