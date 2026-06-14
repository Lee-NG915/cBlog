import React, { useEffect, useState, useRef } from 'react';
import ReactPicture from 'components/ReactPicture';
import SvgIcon from 'components/SvgIcon';
import PriceDisplay from 'components/PriceDisplay';
import Spot from 'components/Spot';

import { getVariantLinkObj } from 'utils/link';
import { Link } from 'react-router';
import { EVENT_SHOP_THE_LOOK } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from '../style.scss';

export default function HotSpot({ lookId, position, hotspot, viewAll, variantsData, mobileClickHandler }) {
  const { desktop } = useBreakpoints();
  const isMobile = !desktop;
  const dispatch = useDispatch();
  const [popupIsActive, setPopupIsActive] = useState(viewAll && !isMobile);
  const { x, y, popup, variant_id } = hotspot;
  const variant = variantsData?.[variant_id];
  const wrapperRef = useRef(null);
  const showUpPosition = {
    above: { bottom: '100%' },
    below: { top: '100%' },
    left: { right: '100%' },
    right: { left: '100%' },
  };
  let popUpAttributes = {};
  if (isMobile) {
    popUpAttributes = {
      onClick: mobileClickHandler,
    };
  } else {
    popUpAttributes = {
      onMouseOver: () => {
        setPopupIsActive(true);
      },
      onMouseLeave: () => {
        if (!viewAll) {
          setPopupIsActive(false);
        }
      },
    };
  }

  useEffect(() => {
    setPopupIsActive(viewAll && !isMobile);
  }, [viewAll, isMobile]);

  return (
    <>
      {variant && (
        <div style={{ gridColumn: `${x}/${+x + 1}`, gridRow: `${y}/${+y + 1}` }} {...popUpAttributes} ref={wrapperRef}>
          <Spot stopAnimation={popupIsActive}>
            <Link
              target={isMobile ? '_self' : '_blank'}
              className={`${style.theLook}__hotspot__popup ${popupIsActive ? 'is-active' : ''}`}
              style={showUpPosition[popup]}
              to={getVariantLinkObj(variant)}
              onClick={() => {
                dispatch({
                  type: EVENT_SHOP_THE_LOOK,
                  result: {
                    detailAction: 'product_card_click',
                    label: lookId,
                    position,
                    skuId: variant.sku,
                    skuName: variant.product_name,
                  },
                });
              }}
            >
              <div className={`${style.theLook}__hotspot__popup-left`}>
                {variant.images.length > 0 && (
                  <ReactPicture
                    srcset={variant.images[0].links}
                    alt={variant.name}
                    loader={{
                      ratio: 0.66,
                    }}
                    lazy={false}
                  />
                )}
              </div>
              <div className={`${style.theLook}__hotspot__popup-right`}>
                <div>{variant.product_name}</div>
                <div className={`${style.theLook}__hotspot__popup-right-priceContainer`}>
                  <PriceDisplay price={variant.price} originalPrice={variant.list_price} />
                </div>
              </div>
              <SvgIcon name="arrow-next" />
            </Link>
          </Spot>
        </div>
      )}
    </>
  );
}
