import capitalize from 'lodash/capitalize';
import { FilterGroup as RawFilterGroup, FastClick } from 'searchkit';
import React from 'react';

class FilterGroup extends RawFilterGroup {
  renderFilter(filter, bemBlocks) {
    const { id, value } = filter;
    let newValue = value;
    if (id === 'tags' && typeof value === 'string' && value.includes('_')) {
      newValue = value
        .trim()
        .split('_')
        .filter((word) => !!word)
        .map((word) => capitalize(word))
        .join(' ');
    }
    const newFilter = { ...filter, value: newValue };
    return super.renderFilter(newFilter, bemBlocks);
  }
}

// change close btn "X" display
/* eslint-disable  */
FilterGroup.prototype.renderRemove = function (bemBlocks) {
  if (!this.props.removeFilters) return null;
  return React.createElement(
    FastClick,
    { handler: this.removeFilters },
    React.createElement(
      'div',
      {
        className: bemBlocks.container('remove-action'),
        onClick: this.removeFilters,
      },
      '✕'
    )
  );
};

export default FilterGroup;
