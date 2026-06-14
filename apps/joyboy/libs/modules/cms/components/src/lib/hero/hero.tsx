'use client';

import { StoryblokServerComponent } from '@storyblok/react/rsc';

interface HeroProps {
  blok: {
    items: any[];
  };
}

const Hero = ({ blok }: HeroProps) => {
  const { items } = blok;

  // 递归函数：遍历item里的所有值
  const processItem = (item: any): any => {
    // 如果是数组
    if (Array.isArray(item)) {
      // 检查数组长度是否大于0
      if (item.length > 0) {
        // 检查第一个元素
        const firstElement = item[0];
        // 如果第一个元素是对象
        if (typeof firstElement === 'object' && firstElement !== null) {
          // 检查是否有key为component，值为image或video
          if (firstElement.component === 'image' || firstElement.component === 'video') {
            // 给该object加上isPreload为true
            firstElement.isPreload = true;
          }
        }
      }
      // 递归处理数组中的每个元素
      return item.map((element) => processItem(element));
    }
    // 如果是对象
    else if (typeof item === 'object' && item !== null) {
      const processedItem = { ...item };
      // 遍历对象的所有属性
      for (const key in processedItem) {
        if (Object.prototype.hasOwnProperty.call(processedItem, key)) {
          processedItem[key] = processItem(processedItem[key]);
        }
      }
      return processedItem;
    }
    // 如果是基本类型，直接返回
    return item;
  };

  return (
    <>
      {items.map((item) => {
        // 处理item
        const processedItem = processItem(item);
        return <StoryblokServerComponent blok={processedItem} key={processedItem._uid} />;
      })}
    </>
  );
};

export { Hero };
