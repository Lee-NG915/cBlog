import React from 'react';
import { CheckboxItemList, block } from 'searchkit';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

@connect((state) => ({
  filterOrder: state.filterOrder,
}))
export default class OrderCheckboxItemList extends CheckboxItemList {
  static propTypes = {
    filterOrder: PropTypes.object,
  };

  render() {
    const {
      disabled,
      className,
      mod,
      filterOrder,
      orderProperty,
      itemComponent,
      items = [],
      translate,
      toggleItem,
      setItems,
      multiselect,
      countFormatter,
      showCount,
      docCount,
    } = this.props;
    if (items.length === 0) return null;
    const orderData = filterOrder[orderProperty];
    const bemBlocks = {
      container: block(mod).el,
      option: block(`${mod}-option`).el,
    };
    const toggleFunc = multiselect ? toggleItem : (key) => setItems([key]);

    const tempRenderList = [];
    items.forEach((option) => {
      const label = option.title || option.label || option.key;
      const name = `${translate(label)}`;
      const element = React.createElement(itemComponent, {
        label: name,
        onClick: () => toggleFunc(option.key),
        bemBlocks,
        key: option.key,
        itemKey: option.key,
        count: countFormatter(option.doc_count),
        rawCount: option.doc_count,
        listDocCount: docCount,
        disabled: option.disabled,
        showCount,
        active: this.isActive(option),
      });
      tempRenderList.push(element);
    });
    const values = orderData?.values;
    let finalList = [];
    if (values) {
      const copyList = [...tempRenderList];
      const orderedList = [];
      values?.forEach((item) => {
        const correspondItem = tempRenderList.find((element) => element.props.label === item?.value);
        if (correspondItem) {
          orderedList.push(correspondItem);
          copyList.splice(copyList.indexOf(correspondItem), 1);
        }
      });

      if (copyList.length !== 0) {
        finalList = [...orderedList, ...copyList];
      } else {
        finalList = orderedList;
      }
    } else {
      finalList = tempRenderList;
    }
    return (
      <>
        {finalList.map((item) => (
          <div
            key={item.props?.key}
            data-qa="options"
            className={bemBlocks.container().mix(className).state({ disabled })}
          >
            {item}
          </div>
        ))}
      </>
    );
  }
}
