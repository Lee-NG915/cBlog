import React from 'react';
import { getDate } from 'utils/time';
import PropTypes from 'prop-types';
import { ASSEMBLY_TYPE } from './config';

const LineItemOptions = ({ lineItem, className, type, showAssembly }) => {
  if (lineItem.product_type !== 'bundle' && lineItem.product_type !== 'swatch' && lineItem.product_type !== 'service') {
    const variantOptions = lineItem.variant.variant_option_values?.slice() || [];
    if (showAssembly && lineItem?.variant.assembly_type) {
      variantOptions.push({ presentation: ASSEMBLY_TYPE[lineItem.variant.assembly_type] });
    }

    return (
      <div className={className}>
        {type === 'joint' ? (
          <span>{variantOptions.map((v) => v.presentation).join(' | ')}</span>
        ) : (
          lineItem.variant.variant_option_values &&
          lineItem.variant.variant_option_values.map((v) => (
            <p key={v.option_value_id}>
              {v.option_type_presentation}: {v.presentation}
            </p>
          ))
        )}
      </div>
    );
  }
  if (lineItem.product_type === 'bundle' && lineItem.product_layout === 'bundle_overlay') {
    return (
      <div className={className}>
        {lineItem.bundle_line_items.map((i) => {
          if (i.bundle_option.bundle_option_type !== 'simple' && i.variant.variant_option_values.length > 0) {
            return (
              <p key={i.id}>
                {i.bundle_option.presentation}: {i.variant.variant_option_values[0].presentation}
              </p>
            );
          }
          return null;
        })}
      </div>
    );
  }
  if (lineItem.product_type === 'service' && lineItem.custom_attributes) {
    if (lineItem.custom_attributes.type === 'disposal') {
      return (
        <div className={className}>
          <p>{lineItem.product_name}</p>
        </div>
      );
    }
    if (lineItem.custom_attributes.type === 'carry_up') {
      const { number_of_items: numOfItems, number_of_stories: numOfStories } = lineItem.custom_attributes;
      return (
        <div className={className}>
          <p>{`${numOfItems} x ${numOfItems > 1 ? 'Items' : 'Item'}, ${numOfStories} x ${
            numOfStories > 1 ? 'Storeys' : 'Storey'
          }`}</p>
        </div>
      );
    }
    if (lineItem.custom_attributes.type === 'slot') {
      return (
        <div className={className}>
          <p>
            {`${getDate(lineItem.custom_attributes.start_time).format('ddd, MMM D, ha')} - ${getDate(
              lineItem.custom_attributes.end_time
            ).format('ha')}`}
          </p>
        </div>
      );
    }
  } else {
    return null;
  }
};

LineItemOptions.propTypes = {
  lineItem: PropTypes.object.isRequired,
  className: PropTypes.string,
  type: PropTypes.string,
  showAssembly: PropTypes.bool,
};

export default LineItemOptions;
