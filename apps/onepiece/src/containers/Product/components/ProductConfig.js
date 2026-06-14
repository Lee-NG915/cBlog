import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import classNames from 'classnames';
import Spinner from 'components/Spinner';
import ReactSVG from 'components/ReactSVG';
import { useDesktopHover } from 'utils/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { EVENT_PDP_CONFIG, EVENT_PDP_DETAILS } from 'utils/track/constants';
import { CloseBtn } from 'components/Button';
import { fetchVariant, selectCurrentProduct, selectCurrentVariantStatus } from 'redux/modules/products';
import { Radio } from 'components/Radio';
import { updateBatchOfVariant, updateVariant } from 'redux/modules/productOptions';
import { RadioGroup } from 'components/RadioGroup';
import ReactPicture from 'components/ReactPicture';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Box, Tag } from '@castlery/fortress';
import { freeFabricEnabled } from 'config';
import { ArrowNext } from '@castlery/fortress/Icons';
import ProductFreeSwatch from './ProductFreeSwatch';
import { ProductFabricPopup } from './ProductFabricPopup';
import { useCurrentProduct, useCurrentVariant, useMobileFrame } from '../hooks/product';
import { useImgModal } from '../hooks/gallery';
import { useModel, useConfigOptions, useMaterialPopup, useUpdateVariant, useMaterialLoad } from '../hooks/config';
import style from './style.scss';

const displayMode = {
  // material: 'circle',
  // leg_color: 'circle',
  // wood: 'circle',
  // color_option: 'circle',
  material: 'square',
  leg_color: 'square',
  wood: 'square',
  color_option: 'square',
  frame: 'square',
};

/* display */
const ConfigList = ({ headName, headValue, headAppend, data = [], listItem, children, isBundle }) => {
  const isCustomizationOptionType = !!data.find((it) => it.isCustomized);
  const isStockedOptionType = !!data.find((it) => !it.isCustomized);
  // const { desktop } = useBreakpoints();
  return (
    <div className={style.configList}>
      <div className={`${style.configList}__head`}>
        <h3>{headName}:&nbsp;</h3>
        <span>{headValue}</span>
        {/* {headAppend} */}
      </div>
      {/* <div className={`${style.configList}__container`}>
      {data.map((it) => (
        <div key={it?.id} role="menuitem">
          {listItem(it)}
        </div>
      ))}
    </div> */}
      {headName === 'Material' && !isBundle ? (
        <>
          {isStockedOptionType && (
            <>
              <div className={`${style.configList}__fabric__title`}>Stocked Fabrics</div>
              <div className={`${style.configList}__fabric__content`}>Our most popular fabrics are ready to ship.</div>
              <div className={`${style.configList}__container`}>
                {data
                  .filter((it) => !it.isCustomized)
                  .map((it) => (
                    <div key={it?.id} role="menuitem">
                      {listItem(it)}
                    </div>
                  ))}
              </div>
            </>
          )}

          {isCustomizationOptionType && (
            <>
              <div className={`${style.configList}__fabric__title`}>Custom Fabrics</div>
              <div className={`${style.configList}__fabric__content`}>
                Create a piece made just for you in one of our custom fabrics.
              </div>
              <div className={`${style.configList}__container`}>
                {data
                  .filter((it) => it.isCustomized)
                  .map((it) => (
                    <div key={it?.id} role="menuitem">
                      {listItem(it)}
                    </div>
                  ))}
              </div>
            </>
          )}
          {headAppend}
        </>
      ) : (
        <div className={`${style.configList}__container`}>
          {data.map((it) => (
            <div key={it?.id} role="menuitem">
              {listItem(it)}
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
};

ConfigList.propTypes = {
  headName: PropTypes.string,
  headValue: PropTypes.string,
  headAppend: PropTypes.element,
  data: PropTypes.array,
  listItem: PropTypes.func,
  children: PropTypes.element,
  isBundle: PropTypes.bool,
};

const HoverButton = ({
  mode = 'rectangle',
  src,
  value,
  element,
  // customisable,
  selected,
  clickHandler,
  dataSelenium,
  enableHover = true,
  isCustomized = false,
}) => {
  const { desktop } = useBreakpoints();
  const btn = (hovered) => (
    <button key="hoverButton" type="button" onClick={clickHandler} data-selenium={dataSelenium}>
      {mode === 'rectangle' ? (
        src ? (
          <ReactPicture
            srcset={src}
            loader={{ ratio: 2 / 5 }}
            style={{
              height: '40px',
              // zIndex: '-1',
              opacity: selected ? 1 : '0.3',
            }}
            alt={value}
          />
        ) : (
          <>{element || value}</>
        )
      ) : (
        <>
          <ReactPicture srcset={src.replace('w_800', 'w_60')} loader={1} alt={value || 'option'} />
          {/* <img src={src.replace('w_800', 'w_60')} alt={value || 'option'} /> */}
          {element}
        </>
      )}

      {desktop && (
        <div className={`${style.configList}__options__detail`} key={1}>
          {hovered && enableHover && (
            <MaterialPopUp src={src} value={value} defaultActive={value} customisable={isCustomized} fromConfigItem />
          )}
        </div>
      )}
    </button>
  );
  const newBtn = useDesktopHover(btn);
  return newBtn;
};
HoverButton.propTypes = {
  mode: PropTypes.string,
  src: PropTypes.string,
  value: PropTypes.string,
  clickHandler: PropTypes.func,
  element: PropTypes.element,
  customisable: PropTypes.bool,
  selected: PropTypes.bool,
};

const ConfigItem = ({
  mode = 'rectangle',
  headName,
  src,
  link,
  value,
  element,
  selected,
  customisable,
  clickHandler,
  id,
  isCustomized = false,
}) => {
  const selenium = headName?.toLowerCase();
  const dispatch = useDispatch();
  if (clickHandler && typeof clickHandler === 'function') {
    return (
      <div
        className={classNames({
          [`${style.configList}__rectangleItem`]: mode === 'rectangle',
          [`${style.configList}__circleItem`]: mode === 'circle',
          [`${style.configList}__squareItem`]: mode === 'square',
          activeItem: selected,
        })}
      >
        {src && (
          <HoverButton
            mode={mode}
            src={src}
            value={value}
            element={element}
            selected={selected}
            customisable={customisable}
            clickHandler={clickHandler}
            dataSelenium={selenium}
            enableHover={headName === 'Material'}
            isCustomized={isCustomized}
          />
        )}
        {!src && (
          <button type="button" onClick={clickHandler} data-selenium={selenium}>
            {mode === 'rectangle' && (element || value)}
            {mode === 'square' && value}
            {mode === 'circle' && element}
          </button>
        )}
      </div>
    );
  }
  if (link) {
    return (
      <div
        className={classNames({
          [`${style.configList}__rectangleItem`]: mode === 'rectangle',
          [`${style.configList}__circleItem`]: mode === 'circle',
          [`${style.configList}__squareItem`]: mode === 'square',
          activeItem: selected,
        })}
        onClick={() => {
          const spuName = link
            ?.split('/')?.[2]
            // kebab to title case
            ?.split('-')
            .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
            .join(' ');

          dispatch({
            type: EVENT_PDP_CONFIG,
            result: {
              detailAction: headName?.toLowerCase(),
              label: value,
              spuId: id,
              spuName,
            },
          });
        }}
      >
        <Link to={link} data-selenium={selenium}>
          {src && <img src={src} alt={value || 'option'} />}
          {mode === 'rectangle' && value}
          {element || null}
        </Link>
      </div>
    );
  }
  return null;
};

ConfigItem.propTypes = {
  mode: PropTypes.string,
  headName: PropTypes.string,
  src: PropTypes.string,
  value: PropTypes.string,
  clickHandler: PropTypes.func,
  link: PropTypes.string,
  element: PropTypes.element,
  selected: PropTypes.bool,
  customisable: PropTypes.bool,
  id: PropTypes.number,
  isCustomized: PropTypes.bool,
};

const renderList = ({ data, headName, headValue, headAppend, customisable, children, itemMode, isBundle }) => (
  <ConfigList
    data={data}
    headName={headName}
    headValue={headValue}
    headAppend={headAppend}
    isBundle={isBundle}
    listItem={({ id, src, value, clickHandler, link, element, selected, isCustomized }) => (
      <ConfigItem
        mode={itemMode}
        headName={headName}
        key={id}
        id={id}
        src={src}
        link={link}
        value={value}
        element={element}
        selected={selected}
        customisable={customisable}
        clickHandler={clickHandler}
        isCustomized={isCustomized}
      />
    )}
  >
    {children}
  </ConfigList>
);

/* componenet */
const ModelConfig = () => {
  const { modal, label } = useModel();
  return modal.length
    ? renderList({
        data: modal,
        headName: 'Model',
        headValue: label,
        itemMode: 'rectangle',
      })
    : null;
};

const MaterialPopUp = ({ src, value, defaultActive, customisable, fromConfigItem }) => {
  const { swatchLoading, activeCollection = {} } = useMaterialPopup({
    defaultActive,
    customisable,
    needLoad: fromConfigItem !== true,
  });

  const variantProperties = activeCollection?.variants?.find(
    (v) =>
      v.presentation.toLowerCase().startsWith(defaultActive.toLowerCase()) ||
      defaultActive.toLowerCase().startsWith(v.presentation.toLowerCase())
  )?.variant_properties;

  const properties = activeCollection?.product_properties?.map((item) => {
    const data = variantProperties?.find((it) => item.name === it.property_name);
    return data ? { ...item, ...data } : item;
  });
  const fabricProperties = variantProperties?.filter(
    (it) => it?.property_name === 'fabric_feature' || it?.property_name === 'fabric_type'
  );
  return (
    <div className={style.materialModal}>
      <ReactPicture className={`${style.materialModal}__img__react_picture`} srcset={src} alt={value} />
      {/* <img className={`${style.materialModal}__img`} src={src} alt={value} /> */}
      <div className={`${style.materialModal}__body`}>
        <div className={`${style.materialModal}__body-head`}>
          <h3>{value}</h3>
        </div>
        <div className={`${style.materialModal}__body-content`}>
          {swatchLoading ? (
            <div className={style.loading}>
              <Spinner />
            </div>
          ) : null}
          {fabricProperties?.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {fabricProperties
                ?.sort((a) => (a.property_name === 'fabric_feature' ? 1 : -1))
                ?.sort((a, b) => `${a}`?.localeCompare(b))
                ?.map((it, index) => (
                  <Tag
                    key={index}
                    variant="soft"
                    sx={{
                      borderRadius: '4px',
                      color: 'var(--fortress-palette-brand-charcoal-700)',
                      backgroundColor: `var(--fortress-palette-brand-charcoal-100)`,
                      padding: '0 16px 0 16px',
                      marginBottom: '0 !important',
                      maxWidth: '100%',
                      '& span': {
                        whiteSpace: 'break-spaces',
                      },
                    }}
                  >
                    {it?.value}
                  </Tag>
                ))}
            </Box>
          )}
          {properties?.length > 0 &&
            properties
              ?.sort((a) => (a.presentation === 'Care' ? 1 : -1))
              .map((it) => {
                if (it.value) {
                  return (
                    <React.Fragment key={it.value}>
                      <h4>{it.presentation}</h4>
                      <div>{it.value}</div>
                    </React.Fragment>
                  );
                }
                return null;
              })}
        </div>
      </div>
    </div>
  );
};

MaterialPopUp.propTypes = {
  src: PropTypes.string,
  value: PropTypes.string,
  customisable: PropTypes.bool,
  defaultActive: PropTypes.string,
  fromConfigItem: PropTypes.bool,
};

const useModifiedMaterialConfig = (allConfig) => {
  const { frame } = useMobileFrame();
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  // const { realCustomisable } = useProductOptions();
  return useMemo(
    () =>
      allConfig.map((currentOption) => {
        if (currentOption.optionName === 'material') {
          const { currentData, defaultActive, customisable, freeSwatch, headName, headValue } = currentOption;
          const mobileMaterialModal = () => {
            if (currentData.src) {
              dispatch({
                type: EVENT_PDP_DETAILS,
                result: {
                  detailAction: 'product_property',
                  label: `${headName} - ${headValue}`,
                },
              });

              // frame.openModal(
              //   'mobileModal',
              //   {
              //     content: (
              //       <MaterialPopUp
              //         {...currentData}
              //         defaultActive={defaultActive}
              //         customisable={customisable}
              //         fromConfigItem={false}
              //       />
              //     ),
              //     styleOverflow: 'scroll',
              //     closeSVG: (
              //       <ReactSVG
              //         name="material_close"
              //         style={{
              //           height: '24px',
              //           width: '24px',
              //           borderRadius: '50%',
              //         }}
              //       />
              //     ),
              //   },
              //   { height: 65 }
              // );
              frame.openModal(
                'mobileModal',
                {
                  content: (
                    <ProductFabricPopup
                      {...currentData}
                      defaultActive={defaultActive}
                      customisable={customisable}
                      fromConfigItem={false}
                      originalOptions={currentOption}
                      closeHandler={() => frame.removeModal()}
                      freeSwatch={freeSwatch}
                    />
                  ),
                  styleOverflow: 'scroll',
                  closeSVG: (
                    <ReactSVG
                      name="dismiss"
                      style={{
                        height: '20px',
                        width: '20px',
                        fill: '#C1AF86',
                        stroke: '#C1AF86',
                      }}
                    />
                  ),
                },
                { height: 80 }
              );
            }
          };
          const desktopMaterialModal = () => {
            if (currentData.src) {
              frame.addModal(
                <ProductFabricPopup
                  {...currentData}
                  defaultActive={defaultActive}
                  customisable={customisable}
                  fromConfigItem={false}
                  originalOptions={currentOption}
                  closeHandler={() => frame.removeModal()}
                  freeSwatch={freeSwatch}
                />,
                'side',
                {
                  dismiss: () => frame.removeModal(),
                  position: 'right',
                  maxWidth: 736,
                }
              );
            }
          };

          const handleOpenMaterialModal = () => {
            dispatch({
              type: EVENT_PDP_DETAILS,
              result: {
                detailAction: 'click_through_view_details',
              },
            });
            if (!desktop) {
              mobileMaterialModal();
            } else {
              desktopMaterialModal();
            }
          };
          currentOption.headAppend = (
            <span className={`${style.configList}__button_info`} onClick={handleOpenMaterialModal}>
              View Details
              <ArrowNext />
            </span>
            //   <div className={`${style.configList}__headAppend`}>
            //   <button type="button" onClick={mobileMaterialModal}>
            //     <ReactSVG name="property-info" />
            //   </button>
            // </div>
          );
          // currentOption.children =
          //   !customisable && !realCustomisable ? <ProductFreeSwatch freeSwatch={freeSwatch} customisable /> : null;

          return currentOption;
        }
        return currentOption;
      }),
    [allConfig, frame, dispatch, desktop]
  );
};

const useModifiedOrientationConfig = (allConfig) => {
  const configs = useMemo(
    () =>
      allConfig.map((currentOption) => {
        if (currentOption.optionName?.startsWith('orientation')) {
          currentOption.data = currentOption.data
            .map(({ src, ...it }) => ({
              ...it,
              src,
            }))
            .sort((a) => (a.name.toLowerCase().includes('left') ? -1 : 1));
          return currentOption;
        }
        return currentOption;
      }),
    [allConfig]
  );
  return configs;
};

const useModifiedDisplayMode = (allConfig) => {
  const configs = useMemo(
    () =>
      allConfig.map((currentOption) => {
        currentOption.itemMode = displayMode[currentOption.optionName];
        return currentOption;
      }),
    [allConfig]
  );
  return configs;
};

const useModifiedSizeConfig = (allConfig) => {
  const product = useCurrentProduct();
  const variant = useCurrentVariant();
  const { frame } = useMobileFrame();
  const showExplanation = useCallback(
    (sizeGuideLinks) => {
      frame.addModal(
        <div className={`${style.sizeGuide}__desktopModal`}>
          <div className={`${style.sizeGuide}__container`}>
            <img src={sizeGuideLinks} alt="size guide" />
            <div className={`${style.sizeGuide}__closeBtnContainer`}>
              <CloseBtn
                onClick={() => {
                  frame.removeModal();
                }}
              />
            </div>
          </div>
        </div>,
        'bottomUpFade',
        {
          showBtn: false,
          dismiss: () => {
            frame.removeModal();
          },
        }
      );
    },
    [frame]
  );
  const openImgModal = useImgModal();

  const { desktop } = useBreakpoints();
  return allConfig.map((currentOption) => {
    // target product that is showing Size option (bedding, bed frame, mattress, etc.)
    if (currentOption.headName === 'Size') {
      const sizeGuideLinks = variant.dimension_image?.links || product.dimension_image?.links;
      if (sizeGuideLinks) {
        currentOption.children = (
          <div className={`${style.sizeGuide}`}>
            <a
              className={`${style.sizeGuide}__btn`}
              role="button"
              onClick={() =>
                !desktop
                  ? openImgModal(sizeGuideLinks.large_x2 || sizeGuideLinks.large)
                  : showExplanation(sizeGuideLinks.large)
              }
            >
              Size Guide
            </a>
          </div>
        );
      }
      return currentOption;
    }
    return currentOption;
  });
};

const BatchOptions = () => {
  const dispatch = useDispatch();
  const {
    variantVersions: { batchOfVariant, index },
    selected,
    productSlug,
  } = useSelector(({ productOptions }) => productOptions);

  if (!(batchOfVariant?.length > 1)) return null;
  const currentVariant = batchOfVariant.find(({ batch }) => batch === index);

  const handleChangeBatch = async (targetBatch = 1) => {
    const variant = await dispatch(
      fetchVariant({
        selected,
        batch: targetBatch,
        slug: productSlug,
      })
    );
    dispatch(updateVariant(variant));
    dispatch(updateBatchOfVariant(null, targetBatch));
  };

  return (
    <>
      <div
        className={`${style.configList}__head`}
        style={{
          marginBottom: '15px',
        }}
      >
        <h3>Version:&nbsp;</h3>
        <span> {currentVariant?.batch || batchOfVariant[0].batch}</span>
      </div>
      <RadioGroup defaultValue={batchOfVariant[0].batch} value={currentVariant?.batch} onChange={handleChangeBatch}>
        {batchOfVariant.map(({ variantId, batch }) => (
          <Radio value={batch} shape="button" key={batch}>
            {variantId} : {batch}
          </Radio>
        ))}
      </RadioGroup>
    </>
  );
};

const AllConfig = (props = {}) => {
  const { bundle, customisable } = props;
  const { isLoading } = useSelector(selectCurrentVariantStatus);
  const { desktop } = useBreakpoints();
  const product = useSelector(selectCurrentProduct);
  const productOptionHeightCount = useMemo(
    () =>
      product?.option_types?.reduce((accurate, current) => {
        if (current?.name === 'material') {
          return accurate + 3;
        }
        return accurate + 1;
      }, 0),
    [product?.option_types]
  );
  // TODO when ssr modle , productConfigOptions is empty array,
  // which leads to high CLS as it renders a blank
  let productConfigOptions = useConfigOptions({ bundle, customisable });
  productConfigOptions = useModifiedMaterialConfig(productConfigOptions);
  productConfigOptions = useModifiedOrientationConfig(productConfigOptions);
  productConfigOptions = useModifiedDisplayMode(productConfigOptions);
  productConfigOptions = useModifiedSizeConfig(productConfigOptions);
  return (
    <div
      style={{
        position: 'relative',
        ...(desktop &&
          !bundle && {
            minHeight:
              productOptionHeightCount === 0 || productConfigOptions?.length
                ? 'auto'
                : `${Number(productOptionHeightCount) * 86}px`,
          }),
      }}
    >
      {productConfigOptions.length
        ? productConfigOptions.map(
            ({ data, headName, headValue, headAppend, optionName, children, itemMode, isBundle }) =>
              data.length ? (
                <React.Fragment key={optionName}>
                  {renderList({
                    data,
                    headName,
                    headValue,
                    headAppend,
                    customisable,
                    children,
                    itemMode,
                    isBundle,
                  })}
                </React.Fragment>
              ) : null
          )
        : null}

      <BatchOptions />

      {isLoading && (
        <div
          style={{
            position: 'absolute',
            display: 'block',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <Spinner />
        </div>
      )}
    </div>
  );
};

AllConfig.propTypes = {
  customisable: PropTypes.bool,
  bundle: PropTypes.bool,
};

export const ProductCustom = () => {
  // const ref = useRef();
  // const { customisable, realCustomisable } = useProductOptions();
  const product = useCurrentProduct();
  const currentProduct = product;
  const freeSwatch = currentProduct.show_free_swatch && freeFabricEnabled;
  // useEffect(() => {
  //   let timmer;
  //   if (ref.current) {
  //     if (customisable) {
  //       ref.current.style.cssText = 'max-height: 1000px; opacity: 1;';
  //       timmer = setTimeout(() => {
  //         ref.current.style.overflow = 'visible';
  //       }, 600);
  //     } else {
  //       ref.current.style.cssText = 'max-height: 0px; opacity: 0;';
  //       timmer = setTimeout(() => {
  //         ref.current.style.overflow = 'hidden';
  //       });
  //     }
  //   }
  //   return () => clearTimeout(timmer);
  // }, [customisable, ref]);

  const productConfigOptions = useConfigOptions(false, false);
  const freeSwatchFlag = productConfigOptions.find((config) => config.optionName === 'material');

  // return realCustomisable ? (
  //   <div className={style.customConfig}>
  //     <button className={`${style.customConfig}__button`} type="button" onClick={toggleCustom}>
  //       <span className={`${style.customConfig}__button-val`}>{lang.t('common.customized_products_text')}</span>
  //       <ReactSVG
  //         className={classNames({
  //           [`${style.customConfig}__button-arrow`]: true,
  //           [`${style.customConfig}__button-arrow-active`]: customisable,
  //         })}
  //         name="custom-arrow"
  //       />
  //     </button>
  //     <div
  //       ref={ref}
  //       className={classNames({
  //         [`${style.customConfig}__panel`]: true,
  //         [`${style.customConfig}__border`]: true,
  //       })}
  //       style={{
  //         maxHeight: '0px',
  //         opacity: 0,
  //       }}
  //     >
  //       <div className={`${style.customConfig}__panel-list`}>
  //         <AllConfig customisable />
  //       </div>
  //     </div>
  //     {freeSwatchFlag && <ProductFreeSwatch freeSwatch={freeSwatch} customisable={false} />}
  //   </div>
  // ) : null;
  // return realCustomisable && freeSwatchFlag ? <ProductFreeSwatch freeSwatch={freeSwatch} customisable={false} /> : null;
  return freeSwatchFlag ? <ProductFreeSwatch freeSwatch={freeSwatch} customisable={false} /> : null;
};

const ProductConfig = () => {
  // TODO This will result in the above-the-fold content not having the product option
  useUpdateVariant();
  const { desktop } = useBreakpoints();

  useMaterialLoad({ needLoad: desktop });

  return (
    <div className={style.configPanel}>
      <ModelConfig />
      <AllConfig />
      <ProductCustom />
    </div>
  );
};

export { ModelConfig, AllConfig };

export default ProductConfig;
