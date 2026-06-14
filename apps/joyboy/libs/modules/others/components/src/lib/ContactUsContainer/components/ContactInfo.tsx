'use client';

import { useMemo } from 'react';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ContactInfoCube } from './ContactInfoCube';
import { EcEnv } from '@castlery/config';
import { useCasaEnabled } from '@castlery/shared-components';

type ContactInfoListEntry =
  | {
      type: 'link';
      linkContent: string;
      linkUrl?: string;
    }
  | {
      type: 'text';
      textContent: string[];
    }
  | {
      type: 'gladly button';
      linkContent: string;
    }
  | {
      type: 'Casa button';
      linkContent: string;
    };

type ContactInfoSection = {
  title: string;
  thumbnail: string;
  list: ContactInfoListEntry[];
  note?: string;
};

const contactInfoList: Record<'SG' | 'US' | 'AU' | 'CA' | 'UK', ContactInfoSection[]> = {
  SG: [
    {
      title: 'Visit Us',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937066/hardcode%20pages/visit_store.png',
      list: [
        {
          type: 'link',
          linkContent: 'Orchard Flagship',
          linkUrl: 'showroom',
        },
        {
          type: 'text',
          textContent: ['Mon - Sun & PH:', '10:00am - 9:00pm'],
        },
      ],
      note: 'Note: Some public holidays may have special hours. Check our Google listing for the latest info.',
    },
    {
      title: 'Whatsapp',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937174/hardcode%20pages/whatsapp_icon.png',
      list: [
        {
          type: 'link',
          linkContent: '+65-8241-0030',
          linkUrl: 'https://wa.me/6582410030',
        },
        {
          type: 'text',
          textContent: ['Mon - Sun:', '10:00am - 9:00pm'],
        },
      ],
      note: 'Note: Some public holidays may have special hours.',
    },
  ],
  US: [
    {
      title: 'Visit Us',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937066/hardcode%20pages/visit_store.png',
      list: [
        {
          type: 'link',
          linkContent: 'Chelsea Showroom',
          linkUrl: 'showrooms/new-york-chelsea',
        },
        {
          type: 'text',
          textContent: ['Mon - Sat:', '10:00am - 8:00pm'],
        },
        {
          type: 'text',
          textContent: ['Sun:', '11:00am - 7:00pm'],
        },
      ],
      note: 'Note: Some public holidays may have special hours. Check our Google listing for the latest info.',
    },
    {
      title: 'FAQ',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937481/hardcode%20pages/faq_icon.png',
      list: [
        {
          type: 'link',
          linkContent: 'Read here',
          linkUrl: 'help-center',
        },
      ],
    },
    {
      title: 'Live Chat',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937370/hardcode%20pages/live_chat.png',
      list: [
        {
          type: 'gladly button',
          linkContent: 'Chat with us',
        },
      ],
    },
    {
      title: 'Whatsapp/SMS/Call',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937174/hardcode%20pages/whatsapp_icon.png',
      list: [
        {
          type: 'link',
          linkContent: '+1 424-888-7789',
          linkUrl: 'https://wa.me/14248887789',
        },
      ],
    },
  ],
  AU: [
    {
      title: 'Visit Us',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937066/hardcode%20pages/visit_store.png',
      list: [
        {
          type: 'link',
          linkContent: 'Sydney Showroom',
          linkUrl: 'sydney-showroom',
        },
        {
          type: 'text',
          textContent: ['Mon - Wed & Fri:', '9:00am - 5:30pm'],
        },
        {
          type: 'text',
          textContent: ['Thu:', '9:00am - 9:00pm'],
        },
        {
          type: 'text',
          textContent: ['Sat:', '9:00am - 5:00pm'],
        },
        {
          type: 'text',
          textContent: ['Sun:', '10:00am - 5:00pm'],
        },
        {
          type: 'link',
          linkContent: 'Brisbane Showroom',
          linkUrl: 'brisbane-showroom',
        },
        {
          type: 'text',
          textContent: ['Mon - Sat:', '9:00am - 5:00pm'],
        },
        {
          type: 'text',
          textContent: ['Sun:', '10:00am - 5:00pm'],
        },
      ],
      note: 'Note: Some public holidays may have special hours. Check our Google listing for the latest info.',
    },
    {
      title: 'Live Chat',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937370/hardcode%20pages/live_chat.png',
      list: [
        {
          type: 'gladly button',
          linkContent: 'Chat with us',
        },
        {
          type: 'text',
          textContent: ['Mon - Sun:', '9:00am - 9:00pm (AEST)'],
        },
      ],
    },
    {
      title: 'Whatsapp/SMS/Call',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937174/hardcode%20pages/whatsapp_icon.png',
      list: [
        {
          type: 'link',
          linkContent: '+61 482-072-880',
          linkUrl: 'https://wa.me/61482072880',
        },
        {
          type: 'text',
          textContent: ['Mon - Sun:', '9:00am - 9:00pm (AEST)'],
        },
      ],
    },
  ],
  CA: [
    {
      title: 'Live Chat',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937370/hardcode%20pages/live_chat.png',
      list: [
        {
          type: 'gladly button',
          linkContent: 'Chat with us',
        },
      ],
    },
    {
      title: 'Whatsapp',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937174/hardcode%20pages/whatsapp_icon.png',
      list: [
        {
          type: 'link',
          linkContent: '+1 833-863-7555',
          linkUrl: 'https://wa.me/18338637555',
        },
        {
          type: 'text',
          textContent: ['Mon - Fri:', '8:00am - 8:00pm(PST)'],
        },
      ],
    },
    {
      title: 'SMS/Call',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779938187/hardcode%20pages/sms.png',
      list: [
        {
          type: 'link',
          linkContent: '+1 833-853-5777',
        },
        {
          type: 'text',
          textContent: ['Mon - Fri:', '8:00am - 8:00pm(PST)'],
        },
      ],
    },
  ],
  UK: [
    {
      title: 'Live Chat',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937370/hardcode%20pages/live_chat.png',
      list: [
        {
          type: 'gladly button',
          linkContent: 'Chat with us',
        },
        {
          type: 'text',
          textContent: ['Mon - Fri:', '8:00am - 8:00pm (UK time)'],
        },
      ],
    },
    {
      title: 'Whatsapp',
      thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779937174/hardcode%20pages/whatsapp_icon.png',
      list: [
        {
          type: 'link',
          linkContent: '+44-7578-175500',
          linkUrl: 'https://wa.me/447578175500',
        },
        {
          type: 'text',
          textContent: ['Mon - Fri:', '8:00am - 8:00pm (UK time)'],
        },
      ],
    },
  ],
};

const ContactInfo = () => {
  const { desktop } = useBreakpoints();
  const isCasaEnabled = useCasaEnabled();

  const finalContactInfoList: Record<'SG' | 'US' | 'AU' | 'CA' | 'UK', ContactInfoSection[]> = useMemo(() => {
    const sgContactInfoList: ContactInfoSection[] = [...contactInfoList['SG']];
    const usContactInfoList: ContactInfoSection[] = contactInfoList['US'].map((section) => ({
      ...section,
      list: [...section.list],
    }));

    // 只有在 Casa 启用时才添加 Casa 部分
    if (isCasaEnabled && EcEnv.NEXT_PUBLIC_COUNTRY === 'SG') {
      const casaContactInfo: ContactInfoSection = {
        title: 'Casa',
        thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779938568/hardcode%20pages/casa.png',
        list: [
          {
            type: 'Casa button',
            linkContent: 'Start a chat',
          },
          {
            type: 'text',
            textContent: ['Available 24/7'],
          },
        ],
        note: 'Note: Instant answers for product, orders, and support. Powered by AI. Please check important details during chat.',
      };

      sgContactInfoList.splice(1, 0, casaContactInfo);
    }

    if (isCasaEnabled && EcEnv.NEXT_PUBLIC_COUNTRY === 'US') {
      const usLiveChatSectionIndex = usContactInfoList.findIndex((section) => section.title === 'Live Chat');

      if (usLiveChatSectionIndex >= 0) {
        usContactInfoList[usLiveChatSectionIndex] = {
          title: 'Casa',
          thumbnail: 'https://res.cloudinary.com/castlery/image/upload/v1779938568/hardcode%20pages/casa.png',
          list: [
            {
              type: 'Casa button',
              linkContent: 'Start a chat',
            },
            {
              type: 'text',
              textContent: ['Available 24/7'],
            },
          ],
          note: 'Note: Instant answers for product, orders, and support. Powered by AI. Please check important details during chat.',
        };
      }
    }

    return {
      ...contactInfoList,
      SG: sgContactInfoList,
      US: usContactInfoList,
    };
  }, [isCasaEnabled]);

  return (
    <Stack alignItems="center" gap={desktop ? 10 : 3} sx={(theme) => ({ mb: theme.spacing(10) })}>
      <Typography
        level="h3"
        sx={(theme) => ({
          mb: {
            xs: theme.spacing(2),
            md: theme.spacing(10),
          },
        })}
      >
        {desktop ? "We're here to help" : 'We Are Ready To Help'}
      </Typography>
      {!desktop && (
        <Typography
          level="body1"
          sx={(theme) => ({
            mb: theme.spacing(6),
            color: theme.palette.brand.mono[700],
            textAlign: 'center',
            width: '100%',
            padding: `0 ${theme.spacing(6)}`,
          })}
        >
          Got questions about our products or need help with your order? We’re here for you 24/7.
        </Typography>
      )}
      <Stack
        direction={desktop ? 'row' : 'column'}
        sx={(theme) => ({
          width: '100%',
          padding: `0 ${theme.spacing(6)}`,
          justifyContent: 'center',
          ...(desktop && {
            maxWidth: '1080px',
            padding: 0,
            alignItems: 'flex-start',
          }),
        })}
      >
        {finalContactInfoList[EcEnv.NEXT_PUBLIC_COUNTRY].map((item, index) => (
          <ContactInfoCube
            key={index}
            title={item.title}
            list={item.list}
            note={item?.note}
            thumbnail={item?.thumbnail}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export { ContactInfo };
