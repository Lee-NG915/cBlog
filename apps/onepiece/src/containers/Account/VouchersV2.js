import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Spinner from 'components/Spinner';
import { load as loadVouchers } from 'redux/modules/voucher';
import { useSelector, useDispatch } from 'react-redux';
import Bem from 'utils/bem';
import { formatDate, isBefore, getDate } from 'utils/time';
import ReactPicture from 'components/ReactPicture';
import SvgIcon from 'components/SvgIcon';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import ReactSVG from 'components/ReactSVG';
import TooltipEllipsis from 'components/NewTooltip/TooltipEllipsis';
import Tooltip from 'components/NewTooltip';
// import { Tooltip } from '@castlery/fortress';
// import { InfoFilled } from '@castlery/fortress/Icons';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const Vouchers = () => {
  const voucher = useSelector((state) => state.voucher);
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const { loading, data: vouchers = [], error = '' } = voucher;
  const block = new Bem(style.vouchersV2);
  const voucherRef = useRef(null);

  useEffect(() => {
    dispatch(loadVouchers());
  }, []);

  const stateText = (voucher) => {
    // state 0: available, 1: unavailable, 2: expired,  未开始不返回
    // const state = isBefore(voucher?.content?.startTime) ? 4 : voucher.state;
    const state = voucher.state;
    if (state === 0) {
      return `Valid through ${formatDate(getDate(voucher?.voucherTime?.endTime * 1000))}`;
    }
    if (state === 1) {
      return 'Invalidated';
    }
    if (state === 2) {
      // return `Expired on ${formatDate(voucher?.voucherTime?.endTime)}`;
      return `Expired on ${formatDate(getDate(voucher?.voucherTime?.endTime * 1000))}`;
    }
    return '';
  };

  let content;
  if (vouchers.length === 0) {
    if (error) {
      content = <div className={block.elm('notice')}>{JSON.stringify(error)}</div>;
    } else {
      content = <div className={block.elm('notice')}>You have no vouchers right now.</div>;
    }
  } else {
    content = (
      <>
        <div className={block.elm('list')}>
          {vouchers &&
            vouchers.length > 0 &&
            vouchers.map((v) => (
              <div key={v.code}>
                <div className={block.elm('coupon').state('is-expired', v.state)}>
                  <div className={block.elm('coupon').elm('luster')} />
                  <hr />
                  <div className={block.elm('coupon').elm('shape').mod('left')} />
                  <div className={block.elm('coupon').elm('shape').mod('right')} />

                  <div className={block.elm('coupon').elm('value')}>
                    <div className={block.elm('coupon').elm('title')}>
                      <TooltipEllipsis title={v?.content?.discountDescription} placement="topRight">
                        <span className={block.elm('coupon').elm('title').elm('text')}>
                          {v?.content?.discountDescription}
                        </span>
                      </TooltipEllipsis>
                    </div>
                    <div className={block.elm('coupon').elm('usageDescription')}>
                      {/* <TooltipEllipsis title={v?.content?.usingRuleDetail} placement="topRight"> */}
                      <span>{v?.content?.usingRuleDescription}</span>
                      {/* </TooltipEllipsis> */}
                      {v?.content?.usingRuleDetail && (
                        <Tooltip
                          title={
                            // 将带有换行符的字符串转换为数组
                            v?.content?.usingRuleDetail.split('\n')
                          }
                          placement="topRight"
                        >
                          <ReactSVG name="normal-info" />
                        </Tooltip>
                      )}
                    </div>

                    <div className={block.elm('coupon').elm('expire')}>{stateText(v)}</div>
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
    </div>
  );
};

Vouchers.contextTypes = {
  frame: PropTypes.object,
};

export default Vouchers;
