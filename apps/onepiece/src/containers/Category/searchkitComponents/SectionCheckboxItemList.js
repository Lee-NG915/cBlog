import React from 'react';
import { CheckboxItemList, block } from 'searchkit';
import { getCategories } from 'pages';
import AnimatedPanel from './AnimatedPanel';

export default class SectionCheckboxItemList extends CheckboxItemList {
  render() {
    const {
      mod,
      itemComponent,
      items = [],
      translate,
      toggleItem,
      setItems,
      multiselect,
      countFormatter,
      disabled,
      showCount,
      className,
      docCount,
      isAllCategory,
      taxonomyPermalink,
    } = this.props;

    const bemBlocks = {
      container: block(mod).el,
      option: block(`${mod}-option`).el,
    };
    const toggleFunc = multiselect ? toggleItem : (key) => setItems([key]);

    const categories = getCategories()?.map((key) => ({
      ...key,
      items: [],
    }));

    items.forEach((option) => {
      categories?.some((c) => {
        if (!isAllCategory && option.key.includes('/all-')) {
          return false;
        }
        if (c.children.some((s) => s.permalink === option.key) || c.permalink === option.key) {
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
          c.items.push(element);
          return true;
        }
        return false;
      });
    });

    // sort items based on order
    categories.forEach((c) => {
      c.items.sort((a, b) => {
        const indexA = c.children.findIndex((s) => s.permalink === a.key);
        const indexB = c.children.findIndex((s) => s.permalink === b.key);
        if (indexA === -1) {
          return -1;
        }
        if (indexB === -1) {
          return 1;
        }
        return indexA - indexB;
      });
    });

    if (isAllCategory) {
      return (
        <>
          {categories.map((c) => {
            if (
              Array.isArray(taxonomyPermalink) &&
              (taxonomyPermalink.includes(c.key) ||
                taxonomyPermalink.includes(c.permalink) ||
                taxonomyPermalink.includes(c.name.toLowerCase()))
            ) {
              return c.items.filter((i) => !i?.props?.label.startsWith('All '));
            }
            if (!Array.isArray(taxonomyPermalink) && taxonomyPermalink?.startsWith(c.permalink)) {
              return c.items.filter((i) => !i?.props?.label.startsWith('All '));
            }
            return null;
          })}
        </>
      );
    }

    return (
      <>
        {categories.map((c, index) => {
          const filterItems = c.items;
          if (filterItems.length > 0) {
            return (
              <AnimatedPanel key={index} title={c.name} collapsable defaultCollapsed>
                <div data-qa="options" className={bemBlocks.container().mix(className).state({ disabled })}>
                  {filterItems}
                </div>
              </AnimatedPanel>
            );
          }
          return null;
        })}
      </>
    );
  }
}
