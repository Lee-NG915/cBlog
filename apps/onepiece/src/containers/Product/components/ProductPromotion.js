import React, { useEffect, useState } from 'react';
import { useApiCampaigns } from 'hooks/dy';
import { useDispatch } from 'react-redux';
import { EVENT_PDP_DETAILS } from 'utils/track/constants';
import style from './style.scss';

const ProductPromotion = ({ selector, product, rank }) => {
  const PDPPromotion = useApiCampaigns({
    selectorArray: [selector],
    pageType: 'product',
    shouldCheckIfNeedLoad: false,
    productId: product?.id,
    shouldCheckIfNeedLoadDeep: true,
  })?.[selector]?.[product?.id];

  const [productSkuInfo, setProductSkuInfo] = useState({});

  const dispatch = useDispatch();

  useEffect(() => {
    if (product?.variants?.length > 0) {
      let hasFindVariant = false;
      product?.variants?.forEach((variant) => {
        if (variant.product_slug === product.slug) {
          hasFindVariant = true;
          setProductSkuInfo({
            sku: variant?.sku,
            skuName: variant?.product_name,
          });
        }
      });
      if (!hasFindVariant) {
        setProductSkuInfo({
          sku: product?.variants[0]?.sku,
          skuName: product?.variants[0]?.product_name,
        });
      }
    }
  }, [product]);

  useEffect(() => {
    dispatch({
      type: EVENT_PDP_DETAILS,
      result: {
        detailAction: `impression_product_promotion${rank}`,
        skuId: productSkuInfo.sku,
        skuName: productSkuInfo.skuName,
      },
    });
  }, [productSkuInfo, dispatch, rank]);

  const handleView = async (event) => {
    let href = '';
    const aTagElement = event.target.closest('a');
    if (aTagElement && aTagElement.tagName === 'A') {
      href = aTagElement.getAttribute('href');
    }
    const reportEvent = () => {
      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: `click_product_promotion${rank}`,
          skuId: productSkuInfo.sku,
          skuName: productSkuInfo.skuName,
          dyReportData: {
            decisionId: PDPPromotion?.decisionId,
            variationId: PDPPromotion?.variationId,
          },
        },
      });
    };
    if (!event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      await reportEvent();
    } else {
      reportEvent();
    }
    window.location.href = href;
  };

  const handleHrefClick = (event) => {
    if (event.target.tagName === 'A' || event.target.tagName === 'B') {
      handleView(event);
    }
  };

  if (PDPPromotion?.templateCode) {
    return (
      <div className={style.pdpPromotion}>
        <div className={style.dytmplPromotionIcon}>
          <img
            style={{ width: '16px', height: '16px' }}
            alt="promotion"
            src="https://res.cloudinary.com/castlery/image/upload/v1677638704/static/common/sell_filled.png"
          />
        </div>
        <div dangerouslySetInnerHTML={{ __html: PDPPromotion?.templateCode }} onClick={handleHrefClick} />
      </div>
    );
  }
  return null;
};

export default ProductPromotion;
