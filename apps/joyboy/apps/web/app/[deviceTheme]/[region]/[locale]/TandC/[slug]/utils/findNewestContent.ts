import { isOutdated } from '@castlery/modules-cms-services';

type findNewestContentProps = {
  list: {
    content: string;
    published_at: string;
    ended_at: string;
    disabled: boolean;
  }[];
};

export const findNewestContent = (list: findNewestContentProps['list']) => {
  const newestContent = list.find((item) => {
    const isContentValid = !isOutdated(item.published_at, item.ended_at);
    return isContentValid && !item.disabled;
  });
  return newestContent;
};
