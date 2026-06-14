'use client';

import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Input as FortressInput,
  inputClasses,
  NiceModal,
  Stack,
  useBreakpoints,
} from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { postSubscribeToKlaviyoList } from '@castlery/modules-cms-services';
import { EVENT_FORM_SUBMIT } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import React, { useRef, useState } from 'react';
import sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';

type KlaviyoInputFormProps = {
  blok: {
    klaviyo_signup_form_button: {
      start_decorator: string;
      end_decorator: string;
      variant?: 'primary' | 'secondary' | 'tertiary';
      text: string;
    }[];
    border_color: { value: string };
    background_color: { value: string };
    form_name?: string;
    subscriber_list_name?: string;
    form_description?: string;
    checkbox_active?: boolean;
  };
};

const KlaviyoInputForm = (props: KlaviyoInputFormProps) => {
  const { blok } = props;
  const [value, setValue] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [clicked, setClicked] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const { mobile, desktop } = useBreakpoints();
  const [checkboxSelected, setCheckboxSelected] = useState(true);
  const dispatch = useAppDispatch();
  const { klaviyo_signup_form_button, border_color, background_color, form_name, form_description, checkbox_active } =
    blok;
  if (klaviyo_signup_form_button.length === 0) {
    return null;
  }
  const { end_decorator, variant, text } = klaviyo_signup_form_button[0];
  const endDecorator = end_decorator === 'ArrowRight' ? <ArrowRight /> : null;
  const handleButtonClick = (e) => {
    window.setTimeout(() => {
      setClicked(true);
    }, 200);
    e.preventDefault();
    if (errMsg === '' && blok.subscriber_list_name !== '' && value !== '') {
      setBtnLoading(true);
      const request = postSubscribeToKlaviyoList({
        email: value?.trim(),
        source: 'StoryblokEmailSignUpForm',
        list: [blok.subscriber_list_name],
      });
      request
        .then((res) => {
          setBtnLoading(false);
          setValue('');
          setOpen(true);
          setModalText('We have received your details.');
          setModalTitle('Thank You!');
          dispatch(
            EVENT_FORM_SUBMIT({
              action: 'Storyblok',
              label: encHex.stringify(sha256(value?.trim() || '')) || '',
              method: document.title,
              position: form_name || '',
            })
          );
        })
        .catch((err) => {
          setBtnLoading(false);
          setOpen(true);
          setModalText(String(err));
          setModalTitle('Oops!');
        });
    }
  };
  const handleInvalid = (event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    setErrMsg(event.target?.validationMessage);
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (inputRef.current?.checkValidity()) {
      setErrMsg('');
    }
    setValue(event.target.value);
  };

  return (
    <Stack
      sx={{
        span: {
          a: {
            color: '#fff',
            textDecoration: 'underline',
          },
        },
      }}
    >
      <form onSubmit={handleButtonClick}>
        <FormControl
          sx={(theme) => ({
            height: '50px',
            [`& .${inputClasses.root}`]: {
              height: desktop ? '54px' : '52px',
              paddingLeft: '12px',
              paddingRight: '9px',
              paddingTop: '1px',
              paddingBottom: '1px',
              // height: '50px',
              // borderBottom: 'none',
              backgroundColor: `${background_color.value} !important`,
              '--Input-focusedHighlight': `${border_color.value} !important`,
              // '&: hover': {
              //   borderBottom: 'none',
              // },
              '&::before': {
                '--Input-focusedHighlight': `${border_color.value} !important`,
              },
            },
          })}
        >
          <FortressInput
            id="klaviyo-newsletter-email"
            required
            ref={(node) => {
              if (node) {
                inputRef.current = node.querySelector('input'); // 获取内部的原生 <input>
              }
            }}
            type="email"
            value={value}
            sx={(theme) => ({
              '--Input-decoratorChildHeight': '48px',
              '--Input-gap': 0,
              borderColor: `${border_color.value} !important`,
              backgroundColor: `${background_color.value} !important`,
              position: 'absolute',
              opacity: 0.9,
              zIndex: 9999,
              width: mobile ? '342px' : '520px',
              height: '50px',
              color: theme.palette.brand.charcoal[800],
              '&:hover': {
                color: theme.palette.brand.charcoal[800],
                borderColor: `${border_color.value} !important`,
              },
              '&:active': {
                color: theme.palette.brand.charcoal[800],
                borderColor: `${border_color.value} !important`,
              },
              input: {
                '::placeholder': {
                  color: theme.palette.brand.charcoal[400],
                },
              },
            })}
            onChange={handleChange}
            // onBlur={() => setClicked(false)}
            onInvalid={handleInvalid}
            placeholder="Enter your email"
            endDecorator={
              <Button
                endDecorator={endDecorator}
                variant={variant}
                type="submit"
                onClick={handleButtonClick}
                loading={btnLoading}
                sx={(theme) => ({
                  borderRadius: 0,
                  height: '48px',
                })}
                disabled={!checkboxSelected}
              >
                {text}
              </Button>
            }
          />
          {errMsg && clicked && (
            <>
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  zIndex: 999,
                }}
                onClick={() => setClicked(false)}
              />
              <Box
                sx={{
                  position: 'relative',
                }}
              >
                <Stack
                  sx={(theme) => ({
                    position: 'absolute',
                    left: theme.spacing(4),
                    top: theme.spacing(3),
                    padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
                    borderRadius: '6px',
                    backgroundColor: '#DBCFB5',
                    '&::before': {
                      content: "''",
                      position: 'absolute',
                      left: theme.spacing(3),
                      top: theme.spacing(-1),
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderBottom: '8px solid #DBCFB5',
                    },
                  })}
                >
                  {errMsg}
                </Stack>
              </Box>
            </>
          )}
        </FormControl>
      </form>
      <NiceModal
        open={open}
        onClose={() => setOpen(false)}
        title={modalTitle}
        desc={modalText}
        showCancelBtn={false}
        showConfirmBtn={false}
      />
      {form_description && (
        <Stack gap={3} flexDirection="row" alignItems="center">
          {checkbox_active && (
            <Checkbox
              checked={checkboxSelected}
              onChange={() => setCheckboxSelected(!checkboxSelected)}
              sx={{
                '--variant-outlinedBorder': '#f6f3e7',
                '--variant-outlinedBg': '#f6f3e7',
                '& .MuiCheckbox-checkbox': {
                  borderColor: '#f6f3e7',
                  backgroundColor: '#f6f3e7',
                },
                '&.Mui-checked .MuiCheckbox-checkbox': {
                  borderColor: '#f6f3e7',
                  backgroundColor: '#f6f3e7',
                },
              }}
            />
          )}
          <span
            style={{
              marginTop: '8px',
              color: '#f6f3e7',
              fontSize: desktop ? '14px' : '12px',
            }}
            dangerouslySetInnerHTML={{ __html: form_description }}
          />
        </Stack>
      )}
    </Stack>
  );
};

export { KlaviyoInputForm, KlaviyoInputFormProps };
