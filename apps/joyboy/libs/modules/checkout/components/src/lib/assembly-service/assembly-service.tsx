import { Stack, Typography } from '@castlery/fortress';
import { useCallback, useMemo } from 'react';
import { CheckCircle, RadioButton } from '@castlery/fortress/Icons';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectOrder } from '@castlery/modules-order-domain';
import { updateAssemblyPreferences } from '@castlery/modules-checkout-services';

// export interface AssemblyServiceProps {}

export function AssemblyService() {
  const dispatch = useAppDispatch();

  const order = useAppSelector(selectOrder);
  const availablePreferences = useMemo(() => order?.available_assembly_preferences || [], [order]);
  const selectedPreferences = useAppSelector((state) => state.checkout.assemblyPreferences);

  const checked = useCallback((value: string) => selectedPreferences.includes(value), [selectedPreferences]);
  const handleSelect = useCallback(
    (slug: string) => {
      dispatch(updateAssemblyPreferences([slug]));
    },
    [dispatch]
  );

  return (
    <Stack sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)' }, gap: 2 }}>
      {availablePreferences?.map((item) => (
        <Stack
          key={item.slug}
          sx={{
            p: 2,
            gap: 1,
            background: (theme) => (checked(item.slug) ? theme.palette.brand.terracotta[500] : 'transparent'),
            color: (theme) => (checked(item.slug) ? theme.palette.common.white : theme.palette.text.primary),
            border: (theme) =>
              checked(item.slug)
                ? `1px solid ${theme.palette.brand.terracotta[500]}`
                : `1px solid ${theme.palette.brand.wheat[500]}`,
            cursor: 'pointer',
          }}
          onClick={() => handleSelect(item.slug)}
        >
          <Typography
            level="body2"
            endDecorator={checked(item.slug) ? <CheckCircle sx={{ color: 'inherit' }} /> : <RadioButton />}
            sx={{ justifyContent: 'space-between', color: 'inherit' }}
          >
            {item.title}
          </Typography>
          <Typography
            level="caption2"
            sx={{ color: (theme) => (checked(item.slug) ? 'inherit' : theme.palette.text.secondary) }}
          >
            {item.description}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export default AssemblyService;
