import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router';

import ApiClient from 'helpers/ApiClient';
import { renderImage } from 'utils/image';
import { getVariantLink } from 'utils/link';
import ReactSVG from 'components/ReactSVG';
import Variant from 'components/VariantList/Variant';
import Spinner from 'components/Spinner';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const TaggedImage = ({ image, anchorPoints }, { frame }) => {
  const [ref, inView] = useInView({
    threshold: 0,
    triggerOnce: true,
  });
  const client = useRef(new ApiClient());
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState({});
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const { desktop } = useBreakpoints();

  useEffect(() => {
    const variantIds = anchorPoints.map((anchor) => anchor.variant_id).join(',');
    const loadVariants = (variantIds) => {
      setLoading(true);
      client.current
        .get('/variants', {
          params: {
            ids: variantIds,
          },
        })
        .then((result) => {
          setLoading(false);
          setVariants(
            result.reduce((acc, cur) => {
              acc[cur.id] = cur;
              return acc;
            }, {})
          );
        })
        .catch((error) => {
          setLoading(false);
          console.error(
            JSON.stringify(
              {
                message: 'Failed to load variants in TaggedImage',
                error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
              },
              null,
              2
            )
          );
        });
    };

    if (inView) {
      loadVariants(variantIds);
    }
  }, [inView, anchorPoints]);

  useEffect(() => {
    if (!desktop) {
      // #FIXME: show loading spinner when loading
      if (selectedVariantId && variants[selectedVariantId]) {
        frame.addModal(
          <div className={`${style.taggedImage}__modal`}>
            <Variant
              className={`${style.taggedImage}__modal__variant`}
              variant={variants[selectedVariantId]}
              lazy
              listName="Shop The Look - New Way Of Living"
            />
          </div>,
          'bottomUpFade',
          {
            dismiss: () => setSelectedVariantId(null),
            height: 35,
          }
        );
      } else {
        frame.removeModal();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariantId]);

  return (
    <div
      role="menuitem"
      ref={ref}
      className={style.taggedImage}
      onClick={() => {
        setSelectedVariantId(null);
      }}
    >
      {renderImage(image.url, image.ratio, 0.4, {
        alt: 'Shop The Look',
        lazy: image.lazy,
      })}
      {anchorPoints.map(({ _uid, variant_id: variantId, offset_x: x, offset_y: y }) => {
        const variant = variants[variantId];
        return (
          <div
            key={_uid}
            role="menuitem"
            className={`${style.taggedImage}__tag__container`}
            style={{
              left: `${x * 100}%`,
              top: `${y * 100}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();

              if (variantId === selectedVariantId) {
                setSelectedVariantId(null);
              } else {
                setSelectedVariantId(variantId);
              }
            }}
          >
            <div className={`${style.taggedImage}__tag`}>
              <ReactSVG name="plus" />
            </div>
            {desktop &&
              selectedVariantId === variantId &&
              (!loading && variant ? (
                <Link to={getVariantLink(variant)}>
                  <div role="menuitem" className={`${style.taggedImage}__variant`} onClick={(e) => e.stopPropagation()}>
                    <Variant variant={variant} lazy listName="Shop The Look - New Way Of Living" />
                  </div>
                </Link>
              ) : (
                <div role="menuitem" className={`${style.taggedImage}__variant`} onClick={(e) => e.stopPropagation()}>
                  <Spinner />
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
};

TaggedImage.propTypes = {
  image: PropTypes.object,
  anchorPoints: PropTypes.array,
};

TaggedImage.contextTypes = {
  frame: PropTypes.object,
};

export default TaggedImage;
