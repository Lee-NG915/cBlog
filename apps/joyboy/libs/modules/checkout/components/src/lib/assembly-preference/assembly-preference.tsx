'use client';
import { Stack, Typography, RadioGroup, Radio } from '@castlery/fortress';
import { useState, useEffect } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectAssemblyPreference } from '@castlery/modules-checkout-domain';
import { AssemblyPreferenceTypeEnum, AssemblyPreferenceSchema } from '@castlery/types';

export function AssemblyPreference() {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'assemblyPreference',
  });
  const assemblyPreference = useAppSelector(selectAssemblyPreference);
  const initialValue = (assemblyPreference: AssemblyPreferenceSchema[]) => {
    const activeItem = assemblyPreference?.find((item) => item.active);
    return activeItem?.name;
  };
  const [value, setValue] = useState(initialValue(assemblyPreference || []));

  useEffect(() => {
    if (assemblyPreference && Array.isArray(assemblyPreference) && assemblyPreference.length > 0) {
      setValue(() => initialValue(assemblyPreference));
    }
  }, [assemblyPreference]);

  if (!assemblyPreference || (Array.isArray(assemblyPreference) && assemblyPreference.length === 0)) {
    return null;
  }

  return (
    <Stack
      spacing={3}
      sx={{
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <Typography id={'assembly-preference-title'} level="h3" mb={2}>
        {t('title')}
      </Typography>
      <Typography id={'assembly-preference-desc'} level="body2" mb={4}>
        {t('description')}
      </Typography>
      <RadioGroup
        orientation="horizontal"
        value={value}
        onChange={(e) => setValue(e.target.value as AssemblyPreferenceTypeEnum)}
        sx={{ gap: 4 }}
        name="assembly-preference"
        aria-labelledby={'assembly-preference-title'}
        aria-describedby={'assembly-preference-desc'}
        role="radiogroup"
        aria-required="true"
        aria-activedescendant={`assembly-preference-${value}`}
      >
        {assemblyPreference.map((item) => (
          <Radio
            value={item.name}
            id={`assembly-preference-${item.name}`}
            label={<Typography level="body1">{t(`options.${item.name}`)}</Typography>}
            color="primary"
            checked={value === item.name}
            aria-checked={value === item.name}
            aria-labelledby={`assembly-preference-${item.name}`}
          />
        ))}
      </RadioGroup>
    </Stack>
  );
}

export default AssemblyPreference;
