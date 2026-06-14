import React from 'react';
import { HookForm as FortressForm, Container, Button, Stack, Box } from '@castlery/fortress';
import { formatLayout, getTypes } from './util';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Text, type TextBlokProps } from 'storyblok/text';
import type { FormBlokAction, FormBlokStyling, FormItemListParams } from './type';
import ReCaptcha from 'components/ReCaptcha';

interface BlokProps {
  form_header?: TextBlokProps[];
  form_item_list: FormItemListParams[];
  action_button: FormBlokAction[];
  styling: Partial<FormBlokStyling>[];
}

function HookForm({ blok }: { blok: BlokProps }) {
  const { mobile } = useBreakpoints();
  const reCaptcha = React.useRef(null);
  // console.log('-----blok>>>>', blok);
  const { form_header, form_item_list, action_button, styling } = blok || {};

  const header = React.useMemo(() => (Array.isArray(form_header) ? form_header[0] : {}), [form_header]);
  const { variant, color, layout = '1' } = React.useMemo(() => styling[0] || {}, [styling]);
  const button = React.useMemo(() => (Array.isArray(action_button) ? action_button[0] : {}), [action_button]);
  const formSxProps = formatLayout(layout, mobile);

  const formData = React.useMemo(() => {
    return form_item_list?.reduce(
      (acr: any, cur: any) => {
        const { props = [], rule = [], options, controls, ...rest } = cur || {};
        const { key, label, placeholder, required = false } = props[0] || {};
        const { type, validator, error_message } = rule[0] || {};
        const types = getTypes(type);
        let dateControls = { disabledDateIntervals: {}, disabledDates: [] };
        if (types.type === 'datePicker') {
          const { date_format, default_start_date, before_date, after_date, disabled_dates, disabled_date_range } =
            controls[0] || {};
          if (before_date && new Date(before_date) instanceof Date) {
            dateControls.disabledDateIntervals.before = new Date(before_date);
          }
          if (after_date && new Date(after_date) instanceof Date) {
            dateControls.disabledDateIntervals.after = new Date(after_date);
          }
          if (disabled_date_range && Array.isArray(disabled_date_range)) {
            dateControls.disabledDateIntervals.range = disabled_date_range.map((item: any) => {
              return {
                start: new Date(item.start_date),
                end: new Date(item.end_date),
              };
            });
          }
          if (disabled_dates && Array.isArray(disabled_dates)) {
            dateControls.disabledDates = disabled_dates.map((item: any) => new Date(item.date_blok));
          }
        }
        const itemParams = [
          {
            key,
            label,
            placeholder,
            ...(options && Array.isArray(options) ? { options: options[0]?.list } : {}),
            ...dateControls,
            joyProps: { color, variant },
            ...rest,
            ...types,
          },
        ];
        const validateItem =
          required || validator
            ? {
                [key]: {
                  required,
                  validator,
                },
              }
            : {};

        return {
          form: [...acr.form, ...itemParams],
          validators: { ...acr.validators, ...validateItem },
        };
      },
      { form: [], validators: {} }
    );
  }, [form_item_list, variant, color]);

  const handleSubmit = (data: Record<string, any>) => {
    let form = { ...data };
    if (reCaptcha.current && reCaptcha.current?.getToken()) {
      //判断验证码
      form.recaptcha_response = reCaptcha.current.getToken();
    }
    alert(`action====>>API: ${button.action.url}  DATA:${JSON.stringify(form)}`);
    //执行成功后刷新 reCaptcha.current.reset()
  };

  return (
    <Container>
      <Text blok={header}></Text>
      <Stack
        sx={(theme) => ({
          px: theme.spacing(6),
        })}
      >
        <FortressForm
          form={formData.form}
          submit={handleSubmit}
          validators={formData.validators}
          formSxProps={formSxProps}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              alignItems: 'center',
              p: 6,
            }}
          >
            {!!button?.show_captcha && <ReCaptcha ref={reCaptcha} />}
            <Button
              type="submit"
              variant="solid"
              color={color}
              sx={{ paddingX: 8, mt: 6, marginX: 'auto', display: 'block' }}
            >
              {button.text || 'Submit'}
            </Button>
          </Box>
        </FortressForm>
      </Stack>
    </Container>
  );
}

export { HookForm };
