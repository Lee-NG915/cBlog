import React from 'react';
import { SearchkitComponent, renderComponent } from 'searchkit';
import identity from 'lodash/identity';
import PropTypes from 'prop-types';
import QuickshipAccessor from '../searchkitAccessors/QuickshipAccessor';
import style from './style.scss';

export default class QuickshipFilter extends SearchkitComponent {
  static propTypes = {
    itemComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.node, PropTypes.func]),
  };

  static defaultProps = {
    size: 50,
    showCount: true,
    showMore: true,
    bucketsTransform: identity,
  };

  static contextTypes = {
    searchkit: PropTypes.object,
  };

  _getSearchkit() {
    return this.props.searchkit || this.context.searchkit;
  }

  getAccessorOptions() {
    const { field, id, size, translations, orderKey, orderDirection, fieldOptions } = this.props;
    return {
      field,
      id,
      size,
      translations,
      orderKey,
      orderDirection,
      fieldOptions,
    };
  }

  defineAccessor() {
    return new QuickshipAccessor(this.props.id, this.getAccessorOptions());
  }

  setFilter = (value) => {
    this.accessor.state = this.accessor.state.setValue(value);
    this.searchkit.performSearch();
  };

  getCheckedStatus = () => !!this.accessor.state.getValue();

  onClick = (active) => {
    this.setFilter(active);
  };

  render() {
    const { itemComponent } = this.props;
    return (
      <div className={style.quickship}>
        {renderComponent(itemComponent, {
          active: this.getCheckedStatus(),
          onClick: this.onClick,
        })}
      </div>
    );
  }
}
