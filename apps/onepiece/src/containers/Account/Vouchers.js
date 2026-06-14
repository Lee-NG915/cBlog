import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Spinner from 'components/Spinner';
import { load as loadVouchers } from 'redux/modules/voucher';
import { useSelector, useDispatch } from 'react-redux';
import Bem from 'utils/bem';
import { toPrice } from 'utils/number';
import dayjs from 'dayjs';
import { formatDate, isBefore } from 'utils/time';
import ReactPicture from 'components/ReactPicture';
import SvgIcon from 'components/SvgIcon';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import ApiClient from 'helpers/ApiClient';
import ReactSVG from 'components/ReactSVG';
import TooltipEllipsis from 'components/NewTooltip/TooltipEllipsis';
import Tooltip from 'components/NewTooltip';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';
import ConvertToCredits from './ConvertToCredits';
import { formatPreferences } from './config';

const Vouchers = (props, { frame }) => {
  const voucher = useSelector((state) => state.voucher);
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const { loading, data: vouchers = [], error = '' } = voucher;
  const [showConvertContent, setShowConvertContent] = useState(false);
  const block = new Bem(style.vouchers);
  const voucherRef = useRef(null);
  const convertValid = __YOTPO_ENABLED__ && isBefore('2023-01-01 00:00'); // till December 31 2022.

  const formatVoucher = vouchers.reduce((acc, cur) => {
    const { calculators } = cur;
    if (calculators?.length > 0) {
      const newCal = calculators.map((item) => {
        const { type, preferences } = item || {};
        const { title, description, descriptionInfo } = formatPreferences(type, preferences);
        return {
          ...item,
          title,
          description,
          descriptionInfo,
        };
      });

      const title = newCal.map((item) => item.title)?.join(' & ');
      acc.push({
        ...cur,
        calculators: newCal,
        title,
        description: newCal.length > 1 ? 'Combined Discount' : newCal[0]?.description,
        descriptionInfo: newCal.length > 1 ? title : newCal[0]?.descriptionInfo,
      });
    } else {
      acc.push(cur);
    }
    return acc;
  }, []);

  const convertibleVouchers = formatVoucher.filter((item) => item.can_convert);
  const total = convertibleVouchers?.length * 50;
  const vouchersFormat = convertibleVouchers?.reduce((acc, item) => {
    const value = parseInt(item.discount_value);
    if (acc[value]) {
      acc[value].push(item);
    } else {
      acc[value] = [item];
    }

    return acc;
  }, {});

  useEffect(() => {
    dispatch(loadVouchers());
  }, []);

  const handelCloseModal = () => {
    setShowConvertContent(false);
    voucherRef?.current?.scrollIntoView();
  };

  const handelConvert = (type) => {
    const client = new ApiClient();

    return client
      .post('/users/me/vouchers/exchange', {
        auth: 'strict',
      })
      .then((res) => {
        if (res?.success) {
          if (type === 'modal') {
            frame.removeModal();
          } else {
            handelCloseModal();
          }
          frame.openModal('response', {
            status: 'successful',
            title: 'Vouchers converted!',
            body: {
              contentHtml: (
                <>
                  <span>{total} credits have been added to your account.</span>
                  <Link to={getUrl('rewards')} className={block.elm('terms')}>
                    View Store Credit
                  </Link>
                </>
              ),
            },
          });
          dispatch(loadVouchers());
        } else {
          frame.openModal('response', {
            body: `Something went wrong, please try again later.`,
          });
        }
      })
      .catch((err) => {
        frame.openModal('response', { body: err });
      });
  };

  const openConvertModal = () => {
    if (desktop) {
      frame.addModal(
        <ConvertToCredits
          vouchers={vouchersFormat}
          total={total}
          type="modal"
          onSubmit={() => handelConvert('modal')}
        />,
        'side',
        {
          dismiss: () => frame.removeModal(),
          position: 'right',
          maxWidth: 500,
        }
      );
    } else {
      setShowConvertContent(true);
    }
  };

  let content;
  if (vouchers.length === 0) {
    if (error) {
      content = <div className={block.elm('notice')}>{error}</div>;
    } else {
      content = <div className={block.elm('notice')}>You have no vouchers right now.</div>;
    }
  } else {
    content = (
      <>
        {convertValid && convertibleVouchers?.length > 0 && (
          <div className={block.elm('coupon').elm('notification')}>
            <span role="button" onClick={openConvertModal}>
              Convert Your Vouchers to Credits
            </span>
          </div>
        )}

        <div className={block.elm('list')}>
          {formatVoucher.map((v) => (
            <div key={v.id}>
              <div className={block.elm('coupon').state('is-expired', !dayjs().isBefore(dayjs(v.expired_at)))}>
                {convertValid && v.can_convert && (
                  <span className={block.elm('coupon').elm('tag')}>Review Voucher</span>
                )}
                <div className={block.elm('coupon').elm('luster')} />
                <hr />
                <div className={block.elm('coupon').elm('shape').mod('left')} />
                <div className={block.elm('coupon').elm('shape').mod('right')} />
                <div className={block.elm('coupon').elm('value')}>
                  <div className={block.elm('coupon').elm('title')}>
                    <TooltipEllipsis title={v.title} placement="topRight">
                      <span className={block.elm('coupon').elm('title').elm('text')}>{v.title}</span>
                    </TooltipEllipsis>
                  </div>

                  {v.description && (
                    <div className={block.elm('coupon').elm('description')}>
                      <span>{v.description}</span>

                      {v.calculators?.length === 1 && (
                        <Tooltip placement="topRight" title={v.descriptionInfo} className={style.tooltip}>
                          <ReactSVG name="normal-info" />
                        </Tooltip>
                      )}
                    </div>
                  )}

                  {!v.description && v.min_spend > 0 && (
                    <div className={block.elm('coupon').elm('description')}>
                      <span>Min. spend {toPrice(v.min_spend)}</span>
                    </div>
                  )}

                  <div className={block.elm('coupon').elm('expire')}>
                    {dayjs().isBefore(dayjs(v.expired_at))
                      ? `Valid through ${formatDate(dayjs(v.expired_at).subtract(1, 'day'))}`
                      : `Expired on ${formatDate(v.expired_at)}`}
                  </div>
                </div>
                <div className={block.elm('coupon').elm('code')}>
                  <span>Use code:</span>
                  {v.code}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className={block} ref={voucherRef}>
      {showConvertContent ? (
        <ConvertToCredits vouchers={vouchersFormat} total={total} onClose={handelCloseModal} onSubmit={handelConvert} />
      ) : (
        <>
          <h1 className={style.header}>My Vouchers</h1>
          <div className={block.elm('main')}>
            <Link to={getUrl('rewards')} className={block.elm('banner')}>
              <ReactPicture
                srcset={`https://res.cloudinary.com/castlery/image/upload/v1660616132/static/review/review-us-${
                  !desktop ? 'mobile' : 'desktop'
                }.png`}
                alt="Want more Vouchers?"
                lazy={false}
              />
              <div className={block.elm('banner').elm('text')}>
                <h3>Want more Vouchers?</h3>
                <div>
                  {__YOTPO_ENABLED__ ? (
                    <span>Earn and redeem your credits for discounts on your next purchase.</span>
                  ) : (
                    <span>Earn a $50 voucher per every purchased item reviewed.</span>
                  )}
                  <SvgIcon name="line-right-arrow" color="white" />
                </div>
              </div>
            </Link>

            {content}

            {loading && (
              <div className={block.elm('mask')}>
                <Spinner />
              </div>
            )}
          </div>
          {vouchers.length > 0 && <div className={block.elm('action')}>Voucher codes can be applied in cart.</div>}
        </>
      )}
    </div>
  );
};

Vouchers.contextTypes = {
  frame: PropTypes.object,
};

export default Vouchers;
