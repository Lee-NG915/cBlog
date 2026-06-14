import * as React from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import identity from 'lodash/identity';
import { block } from 'searchkit';
import { Select } from 'components/Form';
import { withUseBreakpoints } from 'utils/page';

@withUseBreakpoints
export default class SortSelect extends React.PureComponent {
  static propTypes = {
    // toggleItem: PropTypes.func,
    setItems: PropTypes.func,
    items: PropTypes.array,
    countFormatter: PropTypes.func,
    selectedItems: PropTypes.array,
    // docCount: PropTypes.number, // number of documents for this list
    disabled: PropTypes.bool,
    mod: PropTypes.string,
    className: PropTypes.string,
    showCount: PropTypes.bool,
    translate: PropTypes.func,
    breakpoints: PropTypes.object,
    // multiselect: PropTypes.bool, // if true, uses toggleI
  };

  static defaultProps = {
    mod: 'sk-select',
    showCount: true,
    translate: identity,
    countFormatter: identity,
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    const { setItems } = this.props;
    const key = value.target ? value.target.value : value;
    setItems([key]);
  }

  getSelectedValue() {
    const { selectedItems = [] } = this.props;
    if (selectedItems.length === 0) return null;
    return selectedItems[0];
  }

  renderOptions() {
    const { items, showCount, translate, countFormatter } = this.props;
    return map(items, ({ key, label, title, disabled, doc_count }) => {
      let text = translate(label || title || key);
      if (showCount && doc_count !== undefined) text += ` (${countFormatter(doc_count)})`;
      return { key, value: text };
    }).reduce((acc, { key, value }) => {
      acc[key] = <div>{value}</div>;
      return acc;
    }, {});
  }

  render() {
    const { mod, className, disabled, breakpoints } = this.props;
    const { desktop } = breakpoints;
    const isMobile = !desktop;
    const bemBlocks = {
      container: block(mod).el,
    };

    return (
      <div className={bemBlocks.container().mix(className).state({ disabled })} data-selenium="sort_filter">
        {!isMobile && <span style={{ fontWeight: 600 }}>Sort By:&nbsp;</span>}
        <Select
          name="sorting selector"
          placeholder={isMobile ? <span style={{ fontWeight: 600 }}>Sort By</span> : null}
          options={this.renderOptions()}
          value={this.getSelectedValue()}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
