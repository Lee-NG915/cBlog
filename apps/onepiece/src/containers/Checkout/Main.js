import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'components/Helmet';
import { getUrl } from 'pages';
import { useSelector } from 'react-redux';
import Collapse from 'components/Collapse';
import ReactSVG from 'components/ReactSVG';
import { toPrice } from 'utils/number';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { load as loadAddOnServices } from 'redux/modules/addOnServices';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Box, Container, Divider, Stack, Typography } from '@castlery/fortress';
import { Stepper, Step, StepButton } from 'fortress';
import { isShippingServiceFeatureEnabled } from 'config';
import Footer from './components/Footer';
import Header from './components/Header';
import OrderSummaryContent from './components/OrderSummaryContent';

import ShippingAddress from './ShippingAddress';
import ShippingMethod from './ShippingMethod';
import Payment from './Payment';
import style from './style.scss';

const Main = ({ location }, { router }) => {
  const order = useSelector((state) => state.cart.data);
  const { desktop } = useBreakpoints();

  const pages = ['Shipping information', 'Shipping method', 'Payment'];

  const urls = [getUrl('checkout-shipping-address'), getUrl('checkout-shipping-method'), getUrl('checkout-payment')];

  const renderedPages = [
    <ShippingAddress key="ShippingAddress" />,
    <ShippingMethod key="ShippingMethod" />,
    <Payment key="Payment" />,
  ];

  const { pathname, query } = location;
  const pageIndex = urls.indexOf(pathname);

  const total = toPrice(+order.total);

  const warningMessages = order.checkout_error_messages;
  const items = [...order.line_items, ...order.addon_service_line_items];
  const isServiceOrder = query.serviceOrder;

  return (
    <Stack
      sx={(theme) => ({
        minHeight: '100vh',
        fontFamily: 'Aime',
        backgroundColor: '#FBF9F4',
        '--fortress-fontFamily-body': 'Aime',
      })}
      justifyContent="space-between"
    >
      <Helmet path={pathname} />
      <Header />
      <Container
        sx={{
          flex: 1,
          display: 'flex',
        }}
        disableGutters
      >
        <Stack
          direction={desktop ? 'row' : 'column'}
          divider={<Divider orientation="vertical" sx={{ '--Divider-lineColor': '#BEBEBE' }} />}
          spacing={{
            md: 3,
            lg: 5,
            xl: 9,
          }}
          sx={{
            flex: 1,
          }}
        >
          <Stack
            sx={{
              flex: 1,
            }}
            pb={9}
          >
            {isServiceOrder ? (
              <Stack sx={{ px: '24px' }}>
                <h1 className={`${style.title}-schedule`}>Delivery Schedule &amp; Services</h1>
              </Stack>
            ) : (
              <Stack
                sx={(theme) => ({
                  ...(!desktop && { mt: -1, padding: '20px 0 15px' }),
                  ...(desktop && {
                    padding: '70px 0 60px',
                  }),
                })}
              >
                <Stepper
                  activeStep={pageIndex}
                  sx={(theme) => ({
                    '--fortress-palette-primary-solidBg': '#844025',
                    '.MuiButton-root': {
                      textTransform: 'unset',
                    },
                    '.MuiAvatar-root': {
                      ...theme.typography.h4,
                      color: '#C6A79B',
                      borderColor: '#C6A79B',
                    },
                    '.MuiStepLabel-label': {
                      ...theme.typography.h4,
                      color: '#C6A79B',
                    },
                    '.Mui-active, .Mui-completed': {
                      color: '#844025',
                      '.MuiAvatar-root': {
                        ...theme.typography.h4,
                        color: '#F6F3E7',
                      },
                    },
                    '.MuiStepConnector-line': {
                      borderColor: '#C6A79B',
                    },
                  })}
                >
                  {pages.slice(0, +order.total === 0 ? 2 : 3).map((label, index) => (
                    <Step key={index}>
                      <StepButton
                        onClick={(e, { active, completed }) => {
                          if (active || completed) {
                            router.push(urls[index]);
                          }
                        }}
                        sx={{
                          textTransform: 'capitalize',
                        }}
                      >
                        {/* {label} */}
                        <Typography level="h5">{label}</Typography>
                      </StepButton>
                    </Step>
                  ))}
                </Stepper>
              </Stack>
            )}

            {warningMessages?.length > 0 && (
              <div className={`${style.summary}__warning-container`}>
                {warningMessages.map((warning, index) => (
                  <div
                    key={index}
                    dangerouslySetInnerHTML={{
                      __html: warning,
                    }}
                  />
                ))}
              </div>
            )}
            {!desktop && (
              <div className={`${style.summary}__wrapper`}>
                <Collapse
                  header={
                    <div className={`${style.summary}__header`}>
                      <div>
                        Order summary&nbsp;
                        <span>
                          ({order.item_count} item{order.item_count > 1 && 's'})
                        </span>
                      </div>
                      <div>
                        {total}
                        <div>
                          <ReactSVG name="arrow-down" />
                        </div>
                      </div>
                    </div>
                  }
                  content={
                    <div>
                      <OrderSummaryContent
                        data={items}
                        type={order.create_type}
                        className={`${style.summary}__summary`}
                      />
                    </div>
                  }
                  collapse={!order.auto_apply_voucher_message}
                  className={style.summary}
                />
              </div>
            )}

            <Container
              sx={{
                pt: {
                  xs: 4,
                  md: 0,
                },
              }}
            >
              {renderedPages[pageIndex]}
            </Container>
          </Stack>

          <Box
            sx={{
              flexBasis: '35%',
            }}
          >
            {desktop && (
              <Stack
                spacing={3}
                mt={8}
                mr={{
                  md: 3,
                  lg: 5,
                  xl: 9,
                }}
              >
                <Typography level="h2" component="span">
                  Order summary
                </Typography>
                <OrderSummaryContent data={items} type={order.create_type} />
              </Stack>
            )}
          </Box>
        </Stack>
      </Container>

      <Footer />
    </Stack>
  );
};

Main.propTypes = {
  location: PropTypes.object.isRequired,
};
Main.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};

export default asyncLoad([
  ({ location, store: { dispatch } }) => {
    const { pathname } = location || {};
    if (isShippingServiceFeatureEnabled && pathname === getUrl('checkout-shipping-method')) {
      return dispatch(loadAddOnServices());
    }
    return Promise.resolve();
  },
])(React.memo(Main));
