import { NiceModal, Stack, Typography, Button, useBreakpoints, HookForm } from '@castlery/fortress';
import ReactPicture from 'components/ReactPicture';
import { useAlertMsg } from 'containers/Rewards/Alert';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { update as updateUser } from 'redux/modules/auth';
import { Close } from '@castlery/fortress/Icons';
import PropTypes from 'prop-types';
import { getDate } from 'utils/time';

const BirthdayModal = ({ router }) => {
  const user = useSelector((state) => state.auth.user);
  const [btnLoading, setBtnLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [methods, setMethods] = useState({});
  const formRef = useRef();
  const dispatch = useDispatch();

  const { desktop } = useBreakpoints();

  const { show, AlertMsg, alertProps } = useAlertMsg();

  useEffect(() => {
    if (user) {
      setModalOpen(user?.profile?.birthday === '');
    }
  }, [user]);

  const onSubmit = () => {
    // const values = methods.getValues();
    if (formRef.current) {
      const inputElement = formRef.current.querySelector('input');
      let valueStr = inputElement?.value;
      valueStr = valueStr.split(' ').join(' 2 ');
      const date = new Date(valueStr);
      const values = {
        birthday: date.toISOString(),
      };
      setBtnLoading(true);
      dispatch(updateUser({ profile_attributes: values }));
      setModalOpen(false);
      setBtnLoading(false);
      show('Complete your profile to earn 20 credits.');
    }
  };

  const methodsGetter = useCallback(({ getValues }) => setMethods({ getValues }), []);

  if (router.location.pathname !== '/the-castlery-club') {
    return null;
  }

  return (
    <>
      <AlertMsg type="success" router={router} {...alertProps} />
      {desktop && (
        <NiceModal
          onClose={() => {
            setModalOpen(false);
          }}
          open={modalOpen}
          showDefaultFooter={false}
          dialogSx={{
            width: 936,
            padding: 0,
            div: {
              border: 'none',
            },
          }}
        >
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Stack
              sx={{
                minWidth: 404,
                height: 435,
              }}
            >
              <ReactPicture
                srcset="https://res.cloudinary.com/castlery/image/upload/v1730863578/Onepiece/x7ux9zigp0deikajli9w.png"
                alt="BirthdayModalPic"
                loader={{
                  ratio: 435 / 404,
                  height: 435,
                  widths: [404],
                  objectFit: 'contain',
                }}
                lazy={false}
              />
            </Stack>
            <Stack
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: 3,
              }}
            >
              <Typography
                level="h2"
                sx={{
                  marginBottom: 2,
                }}
              >
                Get Your Birthday Treat!
              </Typography>
              <Typography
                sx={{
                  color: (theme) => theme.palette.brand.charcoal[800],
                  textAlign: 'center',
                  marginBottom: 5,
                }}
              >
                We want to celebrate your special day! Let us know your birthday and receive a birthday treat on your
                next birthday.*
              </Typography>
              <Stack
                sx={{
                  position: 'relative',
                  width: '100%',
                  marginBottom: 2,
                  height: '52px',
                  form: {
                    width: '100%',
                    border: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
                  },
                }}
                ref={formRef}
              >
                <HookForm
                  form={[
                    {
                      key: 'birthday',
                      type: 'datePicker',
                      subType: 'yearMonth',
                      placeholder: 'MM/YYYY',
                      defaultStartDate: undefined,
                      disabledDateIntervals: {
                        after: new Date(),
                      },
                      joyProps: {
                        forceType: 'text',
                        popperPlacement: 'left',
                      },
                    },
                  ]}
                  validators={{
                    birthday: { required: true },
                  }}
                  methodsGetter={methodsGetter}
                  formSxProps={{
                    width: '100%',
                  }}
                />
              </Stack>
              <Button
                sx={{
                  marginBottom: 2,
                  width: '100%',
                }}
                loading={btnLoading}
                onClick={onSubmit}
              >
                Add My Birthday
              </Button>
              <Typography
                sx={{
                  fontSize: '12px',
                  lineHeight: '21px',
                  textAlign: 'center',
                  color: (theme) => theme.palette.brand.charcoal[500],
                }}
              >
                T&Cs apply. Birthday rewards will be given out on the first day of every month. Birthday needs to be
                submitted at least 7 days before birthday month to receive the reward. Once saved, this date cannot be
                modified.
              </Typography>
            </Stack>
          </Stack>
        </NiceModal>
      )}
      {!desktop && (
        <NiceModal
          onClose={() => {
            setModalOpen(false);
          }}
          open={modalOpen}
          showCloseBtn={false}
          showDefaultFooter={false}
          dialogSx={{
            width: 358,
            padding: 0,
            div: {
              border: 'none',
              padding: 0,
            },
            '#modal-modal-description': {
              display: 'none',
            },
          }}
        >
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Stack
              sx={{
                position: 'relative',
                maxWidth: 358,
                height: 168,
                overflow: 'hidden',
                backgroundImage:
                  "url('https://res.cloudinary.com/castlery/image/upload/v1730959696/Onepiece/ujcd7bvorgiyezdalcor.jpg')",
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginBottom: 2,
              }}
            >
              <Button
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  width: 24,
                  maxHeight: '24px !important',
                  background: 'transparent',
                }}
                onClick={() => {
                  setModalOpen(false);
                }}
              >
                <Close
                  sx={{
                    width: 24,
                    height: 24,
                    color: (theme) => theme.palette.brand.charcoal[800],
                  }}
                  onClick={() => {
                    setModalOpen(false);
                  }}
                />
              </Button>
            </Stack>
            <Stack
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px !important',
              }}
            >
              <Typography
                level="h2"
                sx={{
                  marginBottom: 2,
                }}
              >
                Get Your Birthday Treat!
              </Typography>
              <Typography
                sx={{
                  color: (theme) => theme.palette.brand.charcoal[800],
                  textAlign: 'center',
                  marginBottom: 2,
                }}
              >
                We want to celebrate your special day! Let us know your birthday and receive a birthday treat on your
                next birthday.*
              </Typography>
              <Stack
                sx={{
                  position: 'relative',
                  width: '100%',
                  marginBottom: 2,
                  height: '49px',
                  padding: '12px 16px !important',
                  border: (theme) => `1px solid ${theme.palette.brand.wheat[500]} !important`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  form: {
                    width: '100%',
                  },
                }}
                ref={formRef}
              >
                <HookForm
                  form={[
                    {
                      key: 'birthday',
                      type: 'datePicker',
                      subType: 'yearMonth',
                      placeholder: 'MM/YYYY',
                      defaultStartDate: undefined,
                      disabledDateIntervals: {
                        after: new Date(),
                      },
                      joyProps: {
                        forceType: 'text',
                        popperPlacement: 'top',
                      },
                    },
                  ]}
                  validators={{
                    birthday: { required: true },
                  }}
                  methodsGetter={methodsGetter}
                  formSxProps={{
                    width: '100%',
                  }}
                />
              </Stack>
              <Button
                sx={{
                  marginBottom: 2,
                  width: '100%',
                }}
                loading={btnLoading}
                onClick={onSubmit}
              >
                Add My Birthday
              </Button>
              <Typography
                sx={{
                  fontSize: '12px',
                  lineHeight: '21px',
                  textAlign: 'center',
                  color: (theme) => theme.palette.brand.charcoal[500],
                }}
              >
                T&Cs apply. Birthday rewards will be given out on the first day of every month. Birthday needs to be
                submitted at least 7 days before birthday month to receive the reward. Once saved, this date cannot be
                modified.
              </Typography>
            </Stack>
          </Stack>
        </NiceModal>
      )}
    </>
  );
};

BirthdayModal.contextTypes = {
  router: PropTypes.object,
};

export default BirthdayModal;
