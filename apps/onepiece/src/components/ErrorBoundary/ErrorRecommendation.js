import React, { useEffect, useState } from 'react';
// import TrackImpression from 'components/TrackImpression';
import { toPrice } from 'utils/number';
import CustomScrollbar from 'components/CustomScrollbar';
import classNames from 'classnames';
import style from './outStyle.scss';

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

const ErrorRecommendation = ({ recommendationInfo }) => {
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
      if (recommendationInfo?.data?.custom) {
        setTitle(recommendationInfo?.data?.custom?.title || '');
        setNeedShowLifeImage(recommendationInfo?.data?.custom?.imageType === '1');
        if (
          recommendationInfo?.data?.custom?.recommendationLink &&
          recommendationInfo?.data?.custom?.recommendationLinkText
        ) {
          setRecommendationLink({
            link: recommendationInfo?.data?.custom?.recommendationLink,
            linkText: recommendationInfo?.data?.custom?.recommendationLinkText,
          });
        }
      }
      if (recommendationInfo?.data?.slots) {
        const groupIds = [];
        let tempProducts = [];
        recommendationInfo?.data?.slots?.forEach((item) => {
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
          if (typeof Number(recommendationInfo?.data?.custom?.recommendationLength) === 'number') {
            productsLength = Number(recommendationInfo?.data?.custom?.recommendationLength);
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
        {title.length !== 0 && <h2 style={{ textAlign: 'center', fontSize: '32px' }}>{title}</h2>}
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
  return null;
};

export default ErrorRecommendation;
