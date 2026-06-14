import { useApiCampaigns } from 'hooks/dy';
import React, { useEffect, useState } from 'react';
// import TrackImpression from 'components/TrackImpression';
import { toPrice } from 'utils/number';
import CustomScrollbar from 'components/CustomScrollbar';
import classNames from 'classnames';
import { EVENT_PRODUCT_CLICK } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import style from './style.scss';

const ProductFromDYTag = ({ tags }) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        boxSizing: 'border-box',
        position: 'absolute',
        // top: '-20px',
        // left: '5px',
        background: '#778379',
        color: '#fff',
        lineHeight: 1.5,
        fontSize: '0.75rem',
        padding: '2px 8px',
      }}
    >
      {tags[0]}
    </div>
  );
};

// const ProductFromDY = ({ key, product, isRootShown, rootRef, needShowLifeImage = false }) => {
//   const { productData } = product;
//   product.id = product.sku;
//   return (
//     <div className={style.productFromDYItem}>
//       <TrackImpression item={productData} rootRef={rootRef} triggerOnce={false} isRootShown={isRootShown}>
//         <div className={style.productFromDY} key={key} style={{ position: 'relative' }}>
//           <ProductFromDYTag tags={productData?.badges || []} />
//           <a href={productData.url}>
//             <div
//               className={style.imageContainer}
//               style={{ minHeight: '240px', display: 'flex', alignItems: 'flex-end' }}
//             >
//               <div className={style.image}>
//                 <img
//                   src={productData.image_url}
//                   alt={productData.spu_name}
//                   style={{ display: needShowLifeImage ? 'none' : 'block' }}
//                 />
//                 <img
//                   src={productData.lifestyle_image}
//                   alt={productData.spu_name}
//                   style={{ display: needShowLifeImage ? 'block' : 'none' }}
//                 />
//               </div>
//             </div>
//             <div className={style.name} style={{ textAlign: 'center' }}>
//               {productData.name}
//             </div>
//             <div
//               className={style.price}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '1.125rem',
//               }}
//             >
//               <div
//                 className={style.salePrice}
//                 style={{
//                   color: productData?.dy_display_price ? '#A45B37' : '#323433',
//                   lineHeight: 1.3,
//                   textAlign: 'center',
//                 }}
//               >
//                 ${productData.sale_price || `${productData.price}.0`}
//               </div>
//               {productData?.dy_display_price && (
//                 <div
//                   className={style.currentPrice}
//                   style={{
//                     color: 'rgb(119, 131, 121)',
//                     marginLeft: '5px',
//                     textDecoration: 'line-through',
//                     fontWeight: 400,
//                   }}
//                 >
//                   ${productData.dy_display_price}
//                 </div>
//               )}
//             </div>
//           </a>
//         </div>
//       </TrackImpression>
//     </div>
//   );
// };

const decorateLink = (link) => {
  if (link?.startsWith('http')) {
    return link;
  }
  if (link?.startsWith('/')) {
    return link;
  }
  if (link?.startsWith('www')) {
    return `https://${link}`;
  }
  return link;
};

const ProductRecommendation = ({ variantId, selector, extraWidget }) => {
  const recommendationInfo = useApiCampaigns({
    selectorArray: [selector],
    pageType: 'product',
    shouldCheckIfNeedLoad: false,
    productId: variantId,
    shouldCheckIfNeedLoadDeep: true,
  })?.[selector]?.[variantId];

  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [products, setProducts] = useState([]);
  const [needShowLifeImage, setNeedShowLifeImage] = useState(false);
  const [recommendationLink, setRecommendationLink] = useState({});

  const priceDisplay = (productData) => (
    <div className={style.dyPrice}>
      {productData?.sale_price && productData?.dy_display_price ? (
        <>
          <span>{toPrice(productData?.sale_price, true)}</span>
          <span>{toPrice(productData?.dy_display_price, true)}</span>
        </>
      ) : (
        toPrice(productData?.dy_display_price || productData?.sale_price, true)
      )}
    </div>
  );

  const handleView = async (sku, spuName, slotId, price, url, e) => {
    const reportEvent = () => {
      dispatch({
        type: EVENT_PRODUCT_CLICK,
        result: {
          slotId,
          variant: {
            sku,
            name: spuName,
            price,
          },
        },
      });
    };
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      await reportEvent();
    } else {
      reportEvent();
    }
    window.location.href = url;
  };

  const removeBgColor = (url) => {
    // 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1645672842/crusader/variants/50440748-AM4001/Madison-Left-Chaise-Sectional-Sofa-Bisque-Front.jpg';
    let newUrl = url;

    if (url?.startsWith('https://res.cloudinary.com/')) {
      const reg = /(.*)\/(private|upload)\/(.*?)\/(.*)/;

      newUrl = url.replace(reg, (match, ...args) => {
        args[2] = args[2].replace(/b_rgb:*((?!,).)*/, '');
        return args.splice(0, 4).filter(Boolean).join('/');
      });
    }
    return newUrl;
  };

  useEffect(() => {
    if (recommendationInfo) {
      if (recommendationInfo?.custom) {
        setTitle(recommendationInfo?.custom?.title || '');
        setNeedShowLifeImage(recommendationInfo?.custom?.imageType === '1');
        if (recommendationInfo?.custom?.recommendationLink && recommendationInfo?.custom?.recommendationLinkText) {
          setRecommendationLink({
            link: recommendationInfo?.custom?.recommendationLink,
            linkText: recommendationInfo?.custom?.recommendationLinkText,
          });
        }
      }
      if (recommendationInfo?.slots) {
        const groupIds = [];
        let tempProducts = [];
        recommendationInfo?.slots?.forEach((item) => {
          const { productData } = item;
          if (productData?.badges) {
            if (productData?.badges.indexOf(',') > -1) {
              const tempArr = [];
              productData?.badges.split(',').forEach((tag) => {
                tempArr.push(tag);
              });
              productData.badges = [tempArr[0]];
            } else {
              productData.badges = [productData.badges];
            }
          }
          if (!groupIds.includes(productData.group_id)) {
            groupIds.push(productData.groupId);
            tempProducts.push(item);
          }
        });
        let productsLength = 50;
        try {
          if (typeof Number(recommendationInfo?.custom?.recommendationLength) === 'number') {
            productsLength = Number(recommendationInfo?.custom?.recommendationLength);
          }
        } catch (e) {
          console.log('recommendationLength configuration illegal');
        }
        tempProducts = tempProducts.slice(0, productsLength);
        setProducts(tempProducts);
      }
    }
  }, [recommendationInfo]);

  if (products.length === 0) {
    return null;
  }

  if (recommendationInfo) {
    return (
      <div
        className={`${style.crossSell}__list`}
        style={{
          marginTop: '30px',
        }}
      >
        {title.length !== 0 && <h2>{title}</h2>}
        {recommendationLink.link && recommendationLink.linkText && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <a
              style={{
                fontSize: '1.125rem',
                color: '#c1af86',
                cursor: 'pointer',
                transition: 'color .2s',
                textDecoration: 'none',
                marginBottom: '35px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              href={decorateLink(recommendationLink.link)}
            >
              <span
                style={{
                  marginRight: '15px',
                }}
              >
                {recommendationLink.linkText}
              </span>
              <svg width="26" height="22" stroke="#c1af86" viewBox="0 0 26 22" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 11h26m0 0L15.38 1M26 11L15.38 21"
                  fill="none"
                  fillRule="evenodd"
                  strokeDasharray="0,0"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>
        )}
        <CustomScrollbar
          content={
            <div className={`${style.recommendations}__content`}>
              {products?.map((item) => {
                if (needShowLifeImage && item?.productData?.lifestyle_image === '') {
                  return null;
                }
                return (
                  <a
                    key={item?.sku}
                    href={item?.productData?.url}
                    onClick={(e) =>
                      handleView(
                        item?.sku,
                        item?.productData?.spu_name,
                        item?.slotId,
                        item?.price,
                        item?.productData?.url,
                        e
                      )
                    }
                    className={`${style.recommendations}__item`}
                    style={{ position: 'relative' }}
                  >
                    <div className={`${style.recommendations}__tagContainer`}>
                      <ProductFromDYTag tags={item.productData?.badges || []} />
                    </div>
                    <div className={classNames(`${style.recommendations}__image`)}>
                      <img
                        src={
                          needShowLifeImage
                            ? item?.productData?.lifestyle_image || item?.productData?.image_url
                            : removeBgColor(item?.productData?.image_url)
                        }
                        alt={title}
                      />
                    </div>
                    <div className={`${style.recommendations}__name`}>{item?.productData?.spu_name}</div>
                    <div className={`${style.recommendations}__price`}>{priceDisplay(item?.productData)}</div>
                  </a>
                );
              })}
            </div>
          }
        />
      </div>
    );
  }
  if (extraWidget) {
    return extraWidget;
  }
  return null;
};

export default ProductRecommendation;
