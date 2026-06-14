import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Spinner from 'components/Spinner';
import ReactSVG from 'components/ReactSVG';
import ReactPicture from 'components/ReactPicture';
import useBreakpoints from 'fortress/hooks/useBreakpoints';
import { Button } from 'fortress';
import { Tag, Box } from '@castlery/fortress';
import { LineRightArrow } from '@castlery/fortress/Icons';
import { VariantCollectionList } from 'components/VariantCollection/VariantCollectionList';
import { useDispatch } from 'react-redux';
import { EVENT_PDP_DETAILS } from 'utils/track/constants';
import { FreeSwatchPopup } from './ProductFreeSwatch';
import { useMaterialPopup } from '../hooks/config';
import style from './style.scss';

export const ProductFabricPopup = (props) => {
  const { customisable, closeHandler, originalOptions, freeSwatch } = props;
  const [selectedMap, setSelectedMap] = React.useState(new Map());
  React.useEffect(() => {
    const tempMap = new Map();
    originalOptions?.data?.forEach((item) => {
      tempMap.set(item.id, item?.selected);
    });
    setSelectedMap(tempMap);
  }, [originalOptions?.data]);
  const [switchFreeSwatch, setSwitchFreeSwatch] = React.useState(false);
  const [targetOption, setTargetOption] = React.useState(originalOptions?.data?.find((it) => it.selected) || null);
  const { desktop } = useBreakpoints();
  const dispatch = useDispatch();
  const stockedFabrics = React.useMemo(
    () => originalOptions?.data?.filter((it) => !it.isCustomized),
    [originalOptions]
  );

  const customFabrics = React.useMemo(() => originalOptions?.data?.filter((it) => it.isCustomized), [originalOptions]);
  const { swatchLoading, activeCollection = {} } = useMaterialPopup({
    defaultActive: targetOption?.value,
    customisable,
    needLoad: true,
  });

  const variantProperties = React.useMemo(
    () =>
      activeCollection?.variants?.find(
        (v) =>
          v.presentation.toLowerCase().startsWith(targetOption?.value?.toLowerCase()) ||
          targetOption?.value?.toLowerCase().startsWith(v.presentation.toLowerCase())
      )?.variant_properties,
    [activeCollection?.variants, targetOption?.value]
  );

  const variantId = React.useMemo(() => {
    const value = targetOption?.value;
    return activeCollection?.variants?.find(
      (v) =>
        v.presentation.toLowerCase().startsWith(value?.toLowerCase()) ||
        value?.toLowerCase().startsWith(v.presentation.toLowerCase())
    )?.id;
  }, [activeCollection?.variants, targetOption?.value]);

  const properties = React.useMemo(
    () =>
      activeCollection?.product_properties?.map((item) => {
        const data = variantProperties?.find((it) => item.name === it.property_name);
        return data ? { ...item, ...data } : item;
      }),
    [activeCollection?.product_properties, variantProperties]
  );

  const fabricProperties = React.useMemo(
    () =>
      variantProperties?.filter((it) => it?.property_name === 'fabric_feature' || it?.property_name === 'fabric_type'),
    [variantProperties]
  );

  const clickHandler = React.useCallback(
    (e) => {
      // rewrite material option click handler
      if (e?.id === targetOption?.id) return;
      selectedMap.set(targetOption?.id, false);
      selectedMap.set(e?.id, true);
      setTargetOption(e);
    },
    [targetOption, selectedMap]
  );
  const selectHandler = React.useCallback(() => {
    // use original click handler
    targetOption?.clickHandler();
    closeHandler();
  }, [closeHandler, targetOption]);
  const handleClickOpenSwatches = React.useCallback(() => {
    dispatch({
      type: EVENT_PDP_DETAILS,
      result: {
        detailAction: 'click_through_get_free_swatches2',
      },
    });
    setSwitchFreeSwatch(true);
  }, []);
  return (
    <>
      {!switchFreeSwatch ? (
        <div className={`${style.configList}__material_popup`}>
          <div className="popup-header">
            {freeSwatch && (
              <span className={`${style.freeSwatchPopup}__freeSwatch__button`} onClick={handleClickOpenSwatches}>
                Get Free Swatches
                <LineRightArrow />
              </span>
            )}
            {desktop && (
              <button type="button" className={`${style.freeSwatchPopup}__drawer__dismiss`} onClick={closeHandler}>
                <ReactSVG name="dismiss" />
              </button>
            )}
          </div>
          <h3 className="fabric-title">{targetOption?.value}</h3>
          {fabricProperties?.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '5px',
                marginTop: '10px',
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
          {stockedFabrics.length !== 0 && (
            <>
              <div className={`${style.configList}__fabric__title`}>Stocked Fabrics</div>
              <div className={`${style.configList}__drawer_card_container`}>
                {stockedFabrics.map((e) => (
                  <div
                    className={classNames({
                      squareItem: true,
                      activeItem: selectedMap.get(e?.id),
                    })}
                    key={e?.id}
                  >
                    {e?.src && (
                      <button type="button" onClick={() => clickHandler(e)} data-selenium="material">
                        <>
                          <ReactPicture src={e?.src.replace('w_800', 'w_60')} alt={e?.value || 'option'} />
                        </>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {customFabrics.length !== 0 && (
            <>
              <div className={`${style.configList}__fabric__title`}>Custom Fabrics</div>
              <div className={`${style.configList}__drawer_card_container`}>
                {customFabrics.map((e) => (
                  <div
                    className={classNames({
                      squareItem: true,
                      activeItem: selectedMap.get(e?.id),
                    })}
                    key={e?.id}
                  >
                    {e?.src && (
                      <button type="button" onClick={() => clickHandler(e)} data-selenium="material">
                        <>
                          <ReactPicture src={e?.src.replace('w_800', 'w_60')} alt={e?.value || 'option'} />
                        </>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {targetOption && targetOption?.src && (
            <ReactPicture
              className="popup-picture"
              srcset={targetOption?.src}
              loader={{ ratio: 0.66 }}
              alt={targetOption?.value || 'fabric'}
            />
          )}
          <Button className="popup-button" onClick={selectHandler} variant="secondary">
            Select Material
          </Button>
          {targetOption?.collection && (
            <React.Fragment key={targetOption?.collection?.id}>
              <div className="popup-description">
                <h4>{targetOption?.collection?.presentation}</h4>
                <div>{targetOption?.collection?.description}</div>
              </div>
            </React.Fragment>
          )}
          {swatchLoading ? (
            <div className={style.loading}>
              <Spinner />
            </div>
          ) : (
            properties?.length > 0 &&
            properties
              ?.sort((a) => (a.presentation === 'Care' ? 1 : -1))
              .map((it) => {
                if (it.value) {
                  return (
                    <React.Fragment key={it.value}>
                      <div className="popup-description">
                        <h4>{it.presentation}</h4>
                        <div>{it.value}</div>
                      </div>
                    </React.Fragment>
                  );
                }
                return null;
              })
          )}
          {variantId && (
            <VariantCollectionList
              title={targetOption?.collection ? `See the entire ${targetOption?.collection?.presentation}` : ''}
              searchCollectionId={variantId}
              materialType={targetOption?.value}
            />
          )}
        </div>
      ) : (
        freeSwatch && (
          <FreeSwatchPopup
            closeHandler={closeHandler}
            customisable
            isFromFabricPopUp
            backHandler={setSwitchFreeSwatch}
          />
        )
      )}
    </>
  );
};

ProductFabricPopup.propTypes = {
  customisable: PropTypes.bool,
  closeHandler: PropTypes.func,
  originalOptions: PropTypes.object,
  freeSwatch: PropTypes.bool,
};
