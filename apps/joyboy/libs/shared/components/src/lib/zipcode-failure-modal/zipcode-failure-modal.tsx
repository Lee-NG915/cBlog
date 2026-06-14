'use client';

import { accessInUS, EcErrorCode, EMAIL_REGEX } from '@castlery/config';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  ModalOverflow,
  Sheet,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { postZipcodeFailureSubscriptionCommand } from '@castlery/modules-product-services';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FortressImage } from '../fortress-image/fortress-image';
import { logger } from '@castlery/observability/client';

interface FormData {
  email: string;
}

const assetPrefix = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_ASSET_PREFIX + '/public' : '';

const bgImage = `${assetPrefix}/images/zipcode-failure/bg.jpg`;

interface ZipcodeFailureModalProps {
  open: boolean;
  onClose: () => void;
  zipcode?: string;
}

export const ZipcodeFailureModal = (props: ZipcodeFailureModalProps) => {
  const { open, onClose, zipcode } = props;

  const user = useAppSelector(selectedActiveUser);
  const dispatch = useAppDispatch();
  const cookies = makePersistenceHandles();
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setError, // 添加setError来设置API错误
  } = useForm<FormData>({
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const resetState = useCallback(() => {
    setSuccess(false);
    reset();
  }, [reset]);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const { desktop, tablet, mobile } = useBreakpoints();

  const onSubmit = async (data: FormData) => {
    try {
      const params: { email: string; extra?: { zipcode: string }; type?: string } = {
        email: data.email,
      };
      if (zipcode) {
        params.extra = { zipcode };
      }
      await dispatch(postZipcodeFailureSubscriptionCommand(params)).unwrap();

      cookies.isSubscribed.setItem(JSON.stringify(true));

      // TODO: 跟踪订阅事件
      // trackSignUpNewsletter(data.email);

      setSuccess(true);
    } catch (error: any) {
      logger.error('Zipcode failure subscription failed', {
        error,
        email: data.email,
        errorCode: error?.data?.errors?.[0]?.code,
      });

      if (error?.data?.errors?.[0]?.code === EcErrorCode.SPECIAL_ZIPCODE_FAILURE) {
        setSuccess(true);
      } else {
        const errorMessage = error?.data?.errors?.[0]?.detail || 'Something went wrong, please try again later.';

        setError('email', {
          type: 'api',
          message: errorMessage,
        });
      }
    }
  };

  // 根据状态确定显示内容
  const getModalContent = () => {
    // 用户已登录状态
    if (user) {
      return {
        showForm: false,
        showSuccessIcon: false,
        title: 'Sorry, we currently do not ship to your specific area',
        description: 'We will email you when we support shipping to your area.',
        buttonText: 'Continue',
        buttonAction: handleClose,
      };
    }

    // 成功状态
    if (success) {
      return {
        showForm: false,
        showSuccessIcon: true,
        title: 'Success!',
        description: 'We will email you when we support shipping to your area.',
        buttonText: 'Continue',
        buttonAction: handleClose,
      };
    }

    // 主表单状态
    return {
      showForm: true,
      showSuccessIcon: false,
      title: 'Sorry, we currently do not ship to your specific area',
      description: 'Subscribe and get notified when we support shipping to your area.',
      buttonText: 'Subscribe',
      buttonAction: undefined, // 表单提交
    };
  };

  const modalContent = getModalContent();

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalOverflow>
        <ModalDialog
          sx={{
            '&.MuiModalDialog-root': {
              '--Card-padding': 0,
              '--variant-borderWidth': 0,
            },
          }}
        >
          <ModalClose />
          <Sheet variant="soft">
            <Stack direction={desktop ? 'row' : 'column'} alignItems={'stretch'}>
              <Box
                sx={{
                  width: desktop ? '400px' : tablet ? '640px' : '342px',
                }}
              >
                <FortressImage
                  src={bgImage}
                  alt="zipcode-failure-modal-image"
                  ratio={desktop ? 1 : tablet ? 1.5 : 1.34}
                  objectFit="cover"
                />
              </Box>
              <Stack
                py={desktop ? 7 : 6}
                px={desktop ? 6 : tablet ? 6 : 4}
                justifyContent={'center'}
                sx={{
                  ...(desktop && {
                    maxWidth: '480px',
                  }),
                  ...(tablet && {
                    maxWidth: '640px',
                  }),
                  ...(mobile && {
                    maxWidth: '342px',
                  }),
                }}
              >
                <Box sx={{ textAlign: 'center', mb: desktop ? 6 : 5 }}>
                  <Typography level="h3" sx={{ mb: 2 }}>
                    {modalContent.title}
                  </Typography>
                  <Typography level="body2">{modalContent.description}</Typography>
                </Box>

                {modalContent.showForm && (
                  <>
                    <Typography level="body2">Email Address*</Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <FormControl sx={{ mb: 2 }}>
                        <Input
                          id="delivery-area-notify-email"
                          placeholder="Enter your email address"
                          type="email"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: EMAIL_REGEX,
                              message: 'Please provide a valid email address',
                            },
                          })}
                          error={!!errors.email}
                          sx={{ px: 4, py: 4 }}
                        />
                        {errors.email && (
                          <Box sx={{ '& div': { position: 'relative', bottom: 0 } }} mt={1}>
                            <FormHelperText sx={{ color: 'danger.500', mt: 1, position: 'relative' }}>
                              <Typography level="caption2">{errors.email.message}</Typography>
                            </FormHelperText>
                          </Box>
                        )}
                        {!accessInUS && (
                          <Box sx={{ '& div': { position: 'relative', bottom: 0 } }} mt={1}>
                            <FormHelperText
                              sx={{
                                mt: 1,
                                position: 'relative',
                              }}
                            >
                              <Typography level="caption2">
                                We promise good vibes only, none of that spam stuff.
                              </Typography>
                            </FormHelperText>
                          </Box>
                        )}
                      </FormControl>
                      <Button
                        variant="primary"
                        loading={isSubmitting}
                        disabled={isSubmitting || !isValid}
                        type="submit"
                        sx={{
                          width: '100%',
                          mt: 6,
                        }}
                      >
                        {modalContent.buttonText}
                      </Button>
                    </form>
                  </>
                )}

                {!modalContent.showForm && (
                  <Button variant="solid" color="primary" onClick={modalContent.buttonAction} sx={{ width: '100%' }}>
                    {modalContent.buttonText}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Sheet>
        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
};
