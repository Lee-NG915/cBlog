import React from 'react';
import PropTypes from 'prop-types';
import ReactPicture from 'components/ReactPicture';
import { getLineItemLink } from 'utils/link';
import { Link } from 'react-router';
import classNames from 'classnames';
import { Tag } from '@castlery/fortress';

const LineItemProductImage = (props, context) => {
  const { lineItem, mediaQuery, className, showLink, imageBg } = props;
  const showO2OTag = lineItem?.visited_in_offline || false;
  // to hold rendered component, for <Link /> to wrap
  let imageComponent;

  if (lineItem.variant.images && lineItem.variant.images[0]) {
    // deal with bundle_overlay layout
    const overlays = [];
    if (lineItem.product_type === 'bundle') {
      lineItem.bundle_line_items.forEach((i) => {
        if (i.bundle_option.bundle_option_type !== 'simple' && i.variant) {
          const { overlay } = i.variant;
          if (overlay) {
            const _links = overlay.links;
            overlays.push({
              mini: _links.mini_overlay,
              mini_x2: _links.mini_x2_overlay,
              small: _links.small_overlay,
              small_x2: _links.small_x2_overlay,
              medium: _links.medium_overlay,
              medium_x2: _links.medium_x2_overlay,
              large: _links.large_overlay,
              large_x2: _links.large_x2_overlay,
            });
          }
        }
      });
    }

    let images = {};
    if (imageBg === 'white') {
      images = lineItem.variant.images[0].links;
    } else {
      const { links } = lineItem.variant.images[0];
      images = {
        mini: links.mini_gray,
        mini_x2: links.mini_x2_gray,
        small: links.small_gray,
        small_x2: links.small_x2_gray,
        medium: links.medium_gray,
        medium_x2: links.medium_x2_gray,
        large: links.large_gray,
        large_x2: links.large_x2_gray,
      };
    }

    imageComponent = (
      <div
        className={classNames(className, {
          'is-swatch': lineItem.product_type === 'swatch',
        })}
      >
        {showO2OTag && (
          <Tag
            size="sm"
            variant="outlined"
            sx={{
              maxWidth: '100%',
              width: '150px',
              textAlign: 'center',
              '--Chip-paddingInline': 0,
              ...(lineItem.product_type === 'swatch' ? { display: 'none' } : {}),
            }}
          >
            Seen at showroom
          </Tag>
        )}
        <ReactPicture
          srcset={overlays.length > 0 ? [images, ...overlays] : images}
          alt={lineItem.product_type === 'swatch' ? lineItem.variant.name : lineItem.variant.product_name}
          loader={{
            ratio: lineItem.product_type === 'swatch' ? 1 : 0.667,
            widths: [200, 250, 300, 400],
            sizes: mediaQuery,
            objectFit: lineItem.product_type === 'swatch' ? '' : 'contain',
          }}
          lazy={false}
        />
      </div>
    );
  } else {
    imageComponent = (
      <div className={className}>
        <ReactPicture alt={lineItem.variant.product_name} loader={{ ratio: 0.667 }} />
      </div>
    );
  }

  if (lineItem.product_type !== 'swatch' && showLink) {
    const link = getLineItemLink(lineItem);
    if (link) {
      return (
        <Link href={`${__BASE_URL__}${link}`} onClick={() => context.frame.removeModal()}>
          {imageComponent}
        </Link>
      );
    }
  }

  return imageComponent;
};

LineItemProductImage.propTypes = {
  lineItem: PropTypes.object.isRequired,
  mediaQuery: PropTypes.string,
  imageBg: PropTypes.string,
  className: PropTypes.string,
  showLink: PropTypes.bool,
};

LineItemProductImage.defaultProps = {
  showLink: true,
  imageBg: 'white',
};

LineItemProductImage.contextTypes = {
  frame: PropTypes.object.isRequired,
};

export default LineItemProductImage;
