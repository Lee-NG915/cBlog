import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getBreakpoint } from 'utils/breakpoints';
import { useBreakpoints } from '@castlery/fortress';
import Spinner from 'components/Spinner';
import { useApiCampaigns } from 'hooks/dy';
import { useDispatch } from 'react-redux';
import { EVENT_PRODUCT_CLICK } from 'utils/track/constants';
import CustomScrollbar from 'components/CustomScrollbar';
import classNames from 'classnames';
import { toPrice } from 'utils/number';
import style from './style.scss';

export const VariantCollectionList = (props) => {
  const { title, materialType } = props;

  const customizedCampaigns =
    useApiCampaigns({
      selectorArray: ['Customized Recommendation'],
      customPageAttribute: {
        material: materialType,
      },
      materialType,
      shouldCheckIfNeedLoad: false,
      shouldCheckIfNeedLoadDeepMaterial: true,
    })?.['Customized Recommendation']?.[materialType] || {};

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const { desktop } = useBreakpoints();
  const [filteredMaterialArr, setFilteredMaterialArr] = useState([]);

  useEffect(() => {
    if (Object.keys(customizedCampaigns).length > 0) {
      setLoading(false);
      const groupIds = [];
      const tempArr = [];
      customizedCampaigns?.forEach((slot) => {
        const { productData } = slot;
        const { group_id } = productData;
        if (!groupIds.includes(group_id)) {
          groupIds.push(group_id);
          tempArr.push(slot);
        }
      });
      setFilteredMaterialArr(tempArr);
    } else if (Array.isArray(customizedCampaigns) && customizedCampaigns.length === 0) {
      setFilteredMaterialArr([]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [customizedCampaigns]);

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

  const handleView = async (sku, skuName, slotId, price, url, e) => {
    const reportEvent = () => {
      dispatch({
        type: EVENT_PRODUCT_CLICK,
        result: {
          slotId,
          variant: {
            sku,
            name: skuName,
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

  return (
    <>
      {!loading && filteredMaterialArr.length !== 0 && (
        <h2
          style={{
            lineHeight: desktop ? '42px' : '27px',
            fontWeight: 'normal',
            marginBottom: '10px',
          }}
        >
          {title}
        </h2>
      )}
      <div
        className={`${style.variantCollectionList}`}
        style={{
          minHeight: loading ? (desktop ? '360px' : '345px') : undefined,
        }}
      >
        {!loading && filteredMaterialArr.length !== 0 && (
          <>
            <CustomScrollbar
              content={
                <div className={`${style.recommendations}__content`}>
                  {filteredMaterialArr?.map((item) => (
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
                        <ProductFromDYTag tags={item.productData?.badges.split(',') || []} />
                      </div>
                      <div className={classNames(`${style.recommendations}__image`)}>
                        <img src={removeBgColor(item?.productData?.image_url)} alt={title} />
                      </div>
                      <div className={`${style.recommendations}__name`}>{item?.productData?.spu_name}</div>
                      <div className={`${style.recommendations}__price`}>{priceDisplay(item?.productData)}</div>
                    </a>
                  ))}
                </div>
              }
            />
          </>
        )}
        {loading && <Spinner />}
      </div>
    </>
  );
};
VariantCollectionList.propTypes = {
  title: PropTypes.string.isRequired,
  materialType: PropTypes.string.isRequired,
};
