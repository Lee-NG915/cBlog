'use client';
import { useMemo, memo } from 'react';
import { Stack, Typography, Tag, useBreakpoints } from '@castlery/fortress';
import { CheckCircle, Cancel } from '@castlery/fortress/Icons';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { DeliveryServiceTypeEnum } from '@castlery/types';

interface ShippingServiceInformationProps {
  type: DeliveryServiceTypeEnum;
  showServiceTag?: boolean;
}

interface ServiceItemProps {
  text: string;
  isSupported: boolean;
}

const SERVICE_TRANSLATIONS_PREFIX_MAPPING: Partial<Record<DeliveryServiceTypeEnum, string>> = {
  [DeliveryServiceTypeEnum.STANDARD]: 'standardService',
  [DeliveryServiceTypeEnum.STANDARD_SERVICE]: 'standardService',
  [DeliveryServiceTypeEnum.ROOM_OF_CHOICE]: 'roomOfChoiceService',
  [DeliveryServiceTypeEnum.WHITE_GLOVE]: 'whiteGloveService',
};

const ServiceItem = ({ text, isSupported }: ServiceItemProps) => {
  const { mobile } = useBreakpoints();
  return (
    <Typography
      level="caption1"
      startDecorator={
        isSupported ? (
          <CheckCircle width={mobile ? 16 : 20} height={mobile ? 16 : 20} />
        ) : (
          <Cancel width={mobile ? 16 : 20} height={mobile ? 16 : 20} />
        )
      }
      sx={{
        alignItems: 'flex-start',
        ...(isSupported
          ? { color: (theme) => theme.palette.brand.leafGreen[500] }
          : { color: (theme) => theme.palette.brand.mono[500] }),
      }}
    >
      {text}
    </Typography>
  );
};

export const ShippingServiceInformation = memo(({ type, showServiceTag = false }: ShippingServiceInformationProps) => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'shippingServices',
  });

  const servicePrefix = SERVICE_TRANSLATIONS_PREFIX_MAPPING[type];

  const { supportedDescriptions, unsupportedDescriptions, tag } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supported = t(`${servicePrefix}.supported` as any, {
      returnObjects: true,
    });

    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsupported = t(`${servicePrefix}.unsupported` as any, {
      returnObjects: true,
    });

    const tag = t(`${servicePrefix}.tag` as any) || '';

    const normalizeToArray = (value: unknown): string[] => {
      if (Array.isArray(value)) return value;
      if (value && typeof value === 'string') return [value];
      return [];
    };

    return {
      supportedDescriptions: normalizeToArray(supported),
      unsupportedDescriptions: normalizeToArray(unsupported),
      tag,
    };
  }, [t, servicePrefix]);

  return (
    <Stack>
      {showServiceTag && tag && <Tag sx={{ mt: 1 }}>{tag}</Tag>}
      <Stack sx={{ gap: 2, mt: 5 }}>
        {supportedDescriptions.map((item) => (
          <ServiceItem key={`supported-${item}`} text={item} isSupported={true} />
        ))}
        {unsupportedDescriptions.map((item) => (
          <ServiceItem key={`unsupported-${item}`} text={item} isSupported={false} />
        ))}
      </Stack>
    </Stack>
  );
});
