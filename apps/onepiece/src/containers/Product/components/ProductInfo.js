import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import ReactPicture from 'components/ReactPicture';
import { getPageByPermalink } from 'pages';
import { EVENT_PDP_DETAILS, EVENT_PDP_IMAGE_DURATION } from 'utils/track/constants';
import { getAssemblerInstruction, selectCurrentVariantIds } from 'redux/modules/productOptions';
import { FrameContext } from 'containers/Frame/FrameContext';
import { useAsync } from 'react-use';
import Video from 'components/Video';
import Spinner from 'components/Spinner';
import Tooltip from 'components/Tooltip';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { enableGuarantee } from 'config';
import { useMobileFrame, useCurrentProduct, useCurrentVariant } from '../hooks/product';
import { useBundle } from '../hooks/bundle';
import { useImgModal } from '../hooks/gallery';
import { combineProperties } from '../hooks/info';
import HullaSection from './HullaSection';

import style from './style.scss';

const PropertyInfoSvg = (props) => {
  const { placement = 'left', title = 'More Info Here', ...rest } = props;
  return (
    <>
      <Tooltip title={title} placement={placement}>
        <ReactSVG
          name="property-info"
          style={{
            width: '14px',
            height: '14px',
          }}
          {...rest}
        />
      </Tooltip>
    </>
  );
};
PropertyInfoSvg.propTypes = {
  placement: PropTypes.string,
  title: PropTypes.string,
};

const AIPopup = ({ data }) => {
  const frame = useContext(FrameContext);
  const { desktop } = useBreakpoints();

  return (
    <div className={style.aIPopup}>
      {desktop && (
        <button
          type="button"
          className={`${style.showroomPopup}__drawer__dismiss`}
          onClick={() => {
            frame?.removeModal();
          }}
          data-selenium="installment_close"
        >
          <ReactSVG name="dismiss" />
        </button>
      )}
      {data?.aiVideos?.length ? (
        <>
          <h2 className={`${style.aIPopup}__title ${style.aIPopup}__title--2`}>Assembly Videos</h2>
          <article className={`${style.aIPopup}__content`}>
            {data?.aiVideos.map(
              ({
                videoInfo: {
                  id,
                  // type, thumbnail,
                  transformId,
                  videoRoot,
                },
              }) => (
                <div className={`${style.aIPopup}__video`} key={id}>
                  <Video
                    id={id}
                    key={id}
                    ratios={1}
                    autoPlay={false}
                    videoRoot={videoRoot}
                    thumbnail={{
                      id: transformId,
                    }}
                    resolution="1080P"
                  />
                </div>
              )
            )}
          </article>
        </>
      ) : (
        ''
      )}
      {data?.aiDocs?.length ? (
        <>
          <h2 className={`${style.aIPopup}__title ${style.aIPopup}__title--2`}>Assembly Instructions</h2>
          <article className={`${style.aIPopup}__content`}>
            {data?.aiDocs.map(({ filename, display_filename: displayFilename, file_link: fileLink }) => (
              <div key={filename} className={`${style.aIPopup}__doc`}>
                <span
                  style={{
                    paddingRight: '0.5em',
                  }}
                >
                  {`View `}
                </span>
                <a
                  className={`${style.aIPopup}__doc--ellipsis ${style.aIPopup}__doc--underline`}
                  href={fileLink}
                  target="_blank"
                >
                  {displayFilename}
                </a>
                <span
                  style={{
                    marginLeft: '0.5em',
                  }}
                >
                  (PDF)
                </span>
              </div>
            ))}
          </article>
        </>
      ) : (
        ''
      )}
    </div>
  );
};
AIPopup.propTypes = {
  data: PropTypes.object,
};

const AIPropertyValue = ({ property = {} } = {}) => {
  const frame = useContext(FrameContext);
  const dispatch = useDispatch();
  const currentVariantIds = useSelector(selectCurrentVariantIds);
  const { desktop } = useBreakpoints();
  const aiData = useAsync(async () => {
    const res = await dispatch(getAssemblerInstruction());
    return res;
  }, [currentVariantIds, dispatch]);

  const openAIModel = () => {
    dispatch({
      type: EVENT_PDP_DETAILS,
      result: {
        detailAction: 'product_property',
        label: `${property.presentation} - ${property.value}`,
      },
    });
    if (!desktop) {
      frame.openModal(
        'mobileModal',
        {
          head: <div style={{ opacity: 0 }}>1</div>,
          content: <AIPopup data={aiData.value} />,
          styleOverflow: 'scroll',
          closeHandler: () => {},
        },
        { height: 60, styleOverflow: 'auto' }
      );
    } else {
      frame.addModal(<AIPopup data={aiData.value} />, 'side', {
        dismiss: () => {
          frame.removeModal();
        },
        position: 'right',
        maxWidth: 500,
      });
    }
  };
  return (
    <>
      <span
        style={{
          position: 'relative',
        }}
      >
        {aiData.loading ? (
          <Spinner right />
        ) : aiData.value?.aiDocs?.length || aiData.value?.aiVideos?.length ? (
          <>
            {property.value}{' '}
            <button
              type="button"
              onClick={() => {
                openAIModel();
              }}
              className="btn"
            >
              <PropertyInfoSvg />
            </button>
          </>
        ) : (
          <>{property.value}</>
        )}
      </span>
    </>
  );
};
AIPropertyValue.propTypes = {
  property: PropTypes.object,
};

const ProductPropertyParis = ({ name, showExplanationOnMobile, showExplanationOnDesktop, warrantyInfo }) => {
  const product = useCurrentProduct();
  const variant = useCurrentVariant();
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const properties = useMemo(
    () =>
      combineProperties(
        product.product_properties[name],
        variant.variant_properties ? variant.variant_properties[name] : []
      ),
    [product, variant, name]
  );

  const isSandGrey = useMemo(
    () =>
      variant.variant_option_values &&
      !!variant.variant_option_values.find((optionValue) => optionValue.name === 'sand_grey'),
    [variant]
  );

  const trackPdpDetails = (pname, value) => {
    dispatch({
      type: EVENT_PDP_DETAILS,
      result: {
        detailAction: 'product_property',
        label: `${pname} - ${value}`,
      },
    });
  };

  const renderValue = (p) => {
    // FIXME: hard code for sand grey
    if (p.name === 'fabric_composition' && isSandGrey) {
      return '90% Polyester, 10% Linen';
    }
    switch (p.name) {
      case 'returns': {
        return (
          <>
            {p.value}
            <a
              role="button"
              className="btn"
              href="/sales-and-refunds"
              target="_blank"
              onClick={() => {
                trackPdpDetails(p.name, p.value);
              }}
            >
              <PropertyInfoSvg />
            </a>
          </>
        );
      }
      case 'warranty': {
        return (
          <>
            <div className="flexContainer">
              <span>
                {`${p.value}`}
                <a
                  role="button"
                  className="btn"
                  href={`/${__COUNTRY__.toLowerCase()}/${enableGuarantee ? 'guarantee' : 'warranty'}`}
                  target="_blank"
                  onClick={() => {
                    trackPdpDetails(p.name, p.value);
                  }}
                >
                  <PropertyInfoSvg />
                </a>
              </span>
              {warrantyInfo.hasOffers && (
                <span>
                  Mulberry Extended warranty (Add-On)
                  <button
                    type="button"
                    onClick={() => {
                      trackPdpDetails('Warranty', 'Mulberry');
                      window.mulberry.inline.instances[0].postMessageClient.listeners
                        .find((x) => x.key === 'mulberry:inline-to-faq')
                        .fn(window.mulberry.core.settings);
                    }}
                    className="btn"
                  >
                    <PropertyInfoSvg />
                  </button>
                </span>
              )}
            </div>
          </>
        );
      }
      case 'assembly_condition': {
        return <AIPropertyValue property={p} />;
      }

      default: {
        return <>{p.value}</>;
      }
    }
  };

  return properties.map((p) => (
    <div className={`${style.info}__property ${p.is_private ? `${style.info}__property--private` : ''}`} key={p.name}>
      <span className={`${style.info}__property__title`}>{p.presentation}:</span>
      <span className={`${style.info}__property__value`}>
        {renderValue(p)}
        {p.explanation && (
          <button
            type="button"
            onClick={() => (!desktop ? showExplanationOnMobile(p) : showExplanationOnDesktop(p))}
            className="btn"
          >
            <PropertyInfoSvg />
          </button>
        )}
      </span>
    </div>
  ));
};

ProductPropertyParis.propTypes = {
  name: PropTypes.string,
};

const ComfortRating = ({
  name,
  totalScore,
  minScorePresentation,
  maxScorePresentation,
  showExplanationOnMobile,
  showExplanationOnDesktop,
}) => {
  const variant = useCurrentVariant();
  const product = useCurrentProduct();
  const { desktop } = useBreakpoints();

  const targetRating = useMemo(
    () =>
      (variant && variant.variant_properties.comfort_ratings.find((r) => r.name === name)) ||
      (product && product.product_properties.comfort_ratings.find((r) => r.name === name)),
    [name, product, variant]
  );

  if (targetRating) {
    const spans = [];
    for (let score = 0; score < totalScore; score += 1) {
      spans.push(
        <span
          key={score}
          className={classNames({
            'is-active': +targetRating.value === score + 1,
          })}
        />
      );
    }
    return (
      <div className={`${style.info}__dnc__cell`}>
        <p className={`${style.info}__dnc__title`}>
          {targetRating.presentation}
          {targetRating.explanation && (
            <button
              type="button"
              className="btn"
              onClick={() =>
                !desktop ? showExplanationOnMobile(targetRating) : showExplanationOnDesktop(targetRating)
              }
            >
              <PropertyInfoSvg placement="right" />
            </button>
          )}
        </p>
        <div className={`${style.info}__dnc__rating`}>
          {minScorePresentation && <span>{minScorePresentation}</span>}
          <div className={`${style.info}__dnc__figure`}>{spans}</div>
          {maxScorePresentation && <span>{maxScorePresentation}</span>}
        </div>
      </div>
    );
  }
  return null;
};
ComfortRating.propTypes = {
  name: PropTypes.string,
  totalScore: PropTypes.number,
  minScorePresentation: PropTypes.string,
  maxScorePresentation: PropTypes.string,
  showExplanationOnMobile: PropTypes.func,
  showExplanationOnDesktop: PropTypes.func,
};

const DimensionComfort = (props) => {
  const open = useImgModal();
  const dispatch = useDispatch();
  const variant = useCurrentVariant();
  const product = useCurrentProduct();
  const timerRef = useRef(null);
  const { desktop } = useBreakpoints();

  const targetLinks = variant.dimension_image?.links || product.dimension_image?.links;

  const handleResetTime = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(
    () => () => {
      handleResetTime();
    },
    []
  );

  if (variant.id !== undefined) {
    return (
      <div className={`${style.info}__dnc`}>
        {targetLinks && (
          <div
            role="button"
            onClick={() => {
              dispatch({
                type: EVENT_PDP_DETAILS,
                result: {
                  detailAction: 'product_property',
                  label: `Dimensions Image`,
                },
              });
              timerRef.current = setTimeout(() => {
                dispatch({
                  type: EVENT_PDP_IMAGE_DURATION,
                  result: {
                    assetPosition: 'product dimension',
                    assetType: 'dimension',
                  },
                });
              }, 5000);
              open(targetLinks.large, 0, handleResetTime);
            }}
          >
            <div className={`${style.info}__dnc__wraper`}>
              <ReactPicture
                className={`${style.info}__dnc__image`}
                srcset={targetLinks}
                alt={`dimension of ${product.name}`}
              />
              {desktop && (
                <div className={`${style.info}__dnc__mask`}>
                  <div>
                    <ReactSVG name="free-swatch-search" />
                    <div>click to expand</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {(variant.variant_properties?.comfort_ratings?.length > 0 ||
          product.product_properties?.comfort_ratings?.length > 0) && (
          <div className={`${style.info}__dnc__content`}>
            <ComfortRating
              name="overall_sit_rating"
              totalScore={5}
              minScorePresentation="Relaxed"
              maxScorePresentation="Upright"
              {...props}
            />
            <ComfortRating
              name="seat_depth_rating"
              totalScore={5}
              minScorePresentation="Shallow"
              maxScorePresentation="Deep"
              {...props}
            />
            <ComfortRating
              name="seat_height_rating"
              totalScore={5}
              minScorePresentation="Low"
              maxScorePresentation="High"
              {...props}
            />
            <ComfortRating
              name="seat_softness_rating"
              totalScore={5}
              minScorePresentation="Soft"
              maxScorePresentation="Firm"
              {...props}
            />
            <ComfortRating name="pillow_density_rating" totalScore={3} {...props} />
            <ComfortRating name="pillow_support_rating" totalScore={3} {...props} />
          </div>
        )}
      </div>
    );
  }
  return null;
};

const DetailPopup = (props) => {
  const { children, forwardRef } = props;
  return (
    <div className={`${style.info}__popup`} ref={forwardRef}>
      <div className={`${style.info}__popup-body`}>{children}</div>
    </div>
  );
};

DetailPopup.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  forwardRef: PropTypes.object,
};

const ProductInfoItem = ({
  header = 'Product Details',
  propertyName = 'product_details',
  action = '',
  warrantyInfo,
  expandByDefault = false,
  forwardRef,
}) => {
  const ref = useRef();

  const [open, setOpen] = useState(expandByDefault);

  const dispatch = useDispatch();

  const toggle = useCallback(
    () =>
      setOpen((prevState) => {
        dispatch({
          type: EVENT_PDP_DETAILS,
          result: {
            detailAction: action,
            label: prevState ? 'close' : 'expand',
          },
        });
        return !prevState;
      }),
    [dispatch, action]
  );

  const { frame } = useMobileFrame();
  const showExplanationOnMobile = useCallback(
    (property) => {
      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: 'product_property',
          label: `${property.presentation} - ${property.value}`,
        },
      });

      frame.openModal(
        'mobileModal',
        {
          head: <div style={{ opacity: 0 }}>1</div>,
          content: (
            <div className={`${style.info}__explanationModal`}>
              <div className={`${style.info}__explanationModal__container`}>
                <div dangerouslySetInnerHTML={{ __html: property.explanation }} />
                {/* <button
                  type="button"
                  className={`btn ${style.info}__explanationModal__close`}
                  onClick={() => frame.removeModal()}
                >
                  <ReactSVG name="close" />
                </button> */}
              </div>
            </div>
          ),
          styleOverflow: 'scroll',
        },
        { height: 60, styleOverflow: 'auto' }
      );
    },
    [frame, dispatch]
  );
  const showExplanationOnDesktop = useCallback(
    (property) => {
      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: 'product_property',
          label: `${property.presentation} - ${property.value}`,
        },
      });

      frame.addModal(
        <div className={`${style.info}__explanationModal`}>
          <div className={`${style.info}__explanationModal__container`}>
            <div dangerouslySetInnerHTML={{ __html: property.explanation }} />
          </div>
          <button
            type="button"
            className={`btn ${style.info}__explanationModal__close`}
            onClick={() => frame.removeModal()}
          >
            <ReactSVG name="dismiss" />
          </button>
        </div>,
        'side',
        {
          dismiss: () => frame.removeModal(),
          position: 'right',
          maxWidth: 500,
        }
      );
    },
    [frame, dispatch]
  );

  useEffect(() => {
    const ele = ref.current;
    const mouseEnter = () => ele.classList.add('hover');
    const mouseLeave = () => ele.classList.remove('hover');
    ele.addEventListener('mouseenter', mouseEnter);
    ele.addEventListener('mouseleave', mouseLeave);
    return () => {
      ele.removeEventListener('mouseenter', mouseEnter);
      ele.removeEventListener('mouseleave', mouseLeave);
    };
  }, []);

  useEffect(() => {
    if (header === 'Product Dimensions' && expandByDefault) {
      setOpen(expandByDefault);
    }
  }, [header, expandByDefault]);

  return (
    <div className={`${style.info}__item`} ref={forwardRef}>
      <div
        className={classNames({
          [`${style.info}__header`]: true,
          active: open,
        })}
        ref={ref}
        role="button"
        onClick={toggle}
      >
        <h3>{header}</h3>
        <div className={`${style.info}__header__icon`} />
      </div>
      <div className={classNames({ [`${style.info}__content`]: true, open })}>
        {header === 'Product Dimensions' && (
          <DimensionComfort
            showExplanationOnMobile={showExplanationOnMobile}
            showExplanationOnDesktop={showExplanationOnDesktop}
          />
        )}
        <ProductPropertyParis
          name={propertyName}
          warrantyInfo={warrantyInfo}
          showExplanationOnMobile={showExplanationOnMobile}
          showExplanationOnDesktop={showExplanationOnDesktop}
        />
      </div>
    </div>
  );
};

ProductInfoItem.propTypes = {
  header: PropTypes.string,
  propertyName: PropTypes.string,
  action: PropTypes.string,
  warrantyInfo: PropTypes.object,
  expandByDefault: PropTypes.bool,
  forwardRef: PropTypes.object,
};

const ProductInfo = ({ dimensionExpand, type, warrantyInfo = { hasOffers: false }, forwardRef, plaCollapsed }) => {
  const product = useCurrentProduct();
  const variant = useCurrentVariant();
  const bundles = useBundle();
  const dispatch = useDispatch();

  let variantIdForHulla = variant.id;
  if (product.product_type === 'bundle') {
    variantIdForHulla = bundles?.[0]?.variant?.id;
  }

  const description = product.description && product.description.replace(/\u00a0/g, ' ');

  const collectionPage = useMemo(() => {
    const taxon = product.taxons.find((t) => t.level === 1 && t.ancestors[0] === 'Collections');
    if (taxon) {
      const page = getPageByPermalink(taxon.permalink);
      if (page) {
        return page;
      }
    }
  }, [product]);

  const trackViewCollection = useCallback(() => {
    dispatch({
      type: EVENT_PDP_DETAILS,
      result: {
        detailAction: 'view_collection',
        label: 'click',
      },
    });
  }, [dispatch]);

  return (
    <div
      className={classNames({
        [`${style.info}__wrapper`]: type !== 'pla',
        [`${style.info}__wrapper2`]: type === 'pla',
        [`${style.info}__wrapper3`]: true,
      })}
    >
      {type !== 'pla' && (
        <div className={`${style.info}__head`}>
          <h2>{description}</h2>
          {collectionPage && (
            <div>
              <Link to={collectionPage.url} onClick={trackViewCollection}>
                View the {collectionPage.name}
              </Link>
            </div>
          )}
        </div>
      )}

      {type !== 'pla' && variantIdForHulla && <HullaSection productId={variantIdForHulla?.toString()} />}

      <ProductInfoItem
        header="Product Material & Care"
        action="details"
        propertyName="product_details"
        expandByDefault={!plaCollapsed}
      />
      <ProductInfoItem
        header="Product Dimensions"
        action="dimensions"
        propertyName="product_dimensions"
        expandByDefault={dimensionExpand}
        forwardRef={forwardRef}
      />
      <ProductInfoItem
        header={enableGuarantee ? 'Delivery & Guarantee' : 'Delivery & Warranty'}
        action="delivery"
        propertyName="delivery_returns"
        warrantyInfo={warrantyInfo}
      />
    </div>
  );
};

ProductInfo.propTypes = {
  dimensionExpand: PropTypes.bool,
  type: PropTypes.string,
  warrantyInfo: PropTypes.object,
  forwardRef: PropTypes.object,
  plaCollapsed: PropTypes.bool,
};

export default ProductInfo;
