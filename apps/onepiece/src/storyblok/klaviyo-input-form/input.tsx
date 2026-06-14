import React, { useState, useRef } from 'react';
import { Input as FortressInput, FormControl, Box, Stack, useBreakpoints } from '@castlery/fortress';
import { Button } from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { useDispatch } from 'react-redux';
import { EVENT_SUBMIT_FORM } from 'utils/track/constants';
import { client } from 'helpers/ApiClient';
import { useFrame } from 'hooks/frame';
import { inputClasses } from '@mui/material';

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
  };
};

const KlaviyoInputForm = (props: InputProps) => {
  const { blok } = props;
  const { desktop } = useBreakpoints();
  const frame = useFrame();
  const [value, setValue] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [clicked, setClicked] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const { mobile } = useBreakpoints();
  const { klaviyo_signup_form_button, border_color, background_color, form_name, form_description } = blok;
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
      const request = client.post('/users/subscriptions/list', {
        data: {
          email: value?.trim(),
          source: 'StoryblokEmailSignUpForm',
          list: [blok.subscriber_list_name],
        },
      });
      request
        .then((res) => {
          setBtnLoading(false);
          dispatch({
            type: EVENT_SUBMIT_FORM,
            result: {
              label: value,
              position: form_name,
            },
          });
          setValue('');
          frame?.openModal('response', {
            status: 'successful',
            title: 'Thank You!',
            body: 'You have successfully subscribed to the newsletter.',
          });
        })
        .catch((err) => {
          setBtnLoading(false);
          if (err?.errors?.[0]?.detail?.indexOf('Code: 10009') > -1) {
            frame?.openModal('response', {
              body: err?.errors?.[0]?.detail,
            });
          } else {
            frame?.openModal('response', {
              status: 'failed',
              title: 'Oops!',
              body: 'The email format is incorrect.',
            });
          }
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
          sx={{
            height: '50px',
            [`& .${inputClasses.root}`]: {
              '--Input-focusedHighlight': `${border_color.value} !important`,
              '&::before': {
                '--Input-focusedHighlight': `${border_color.value} !important`,
              },
            },
          }}
        >
          <FortressInput
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
              borderColor: border_color.value,
              backgroundColor: background_color.value,
              position: 'absolute',
              opacity: 0.9,
              zIndex: 9999,
              width: mobile ? '342px' : '520px',
              color: theme.palette.brand.charcoal[800],
              '&:hover': {
                color: theme.palette.brand.charcoal[800],
                borderColor: border_color.value,
              },
              '&:active': {
                color: theme.palette.brand.charcoal[800],
                borderColor: border_color.value,
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
                  sx={{
                    position: 'absolute',
                    left: '16px',
                    top: '58px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#DBCFB5',
                    '&::before': {
                      content: "''",
                      position: 'absolute',
                      left: '12px',
                      top: '-7px',
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderBottom: '8px solid #DBCFB5',
                    },
                  }}
                >
                  {errMsg}
                </Stack>
              </Box>
            </>
          )}
        </FormControl>
      </form>
      {form_description && (
        <span
          style={{
            marginTop: '8px',
            color: '#fff',
            textAlign: 'center',
            fontSize: desktop ? '14px' : '12px',
          }}
          dangerouslySetInnerHTML={{ __html: form_description }}
        />
      )}
    </Stack>
  );
};

export { KlaviyoInputForm };
