'use client';

import { selectedActiveUser } from '@castlery/modules-user-domain';
import { isOutdated } from '@castlery/modules-cms-services';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import { useSelector } from 'react-redux';

type OptionalBlockListProps = {
  blok: {
    list: {
      login_status: 'logged_in' | 'logged_out' | 'logged_in_or_out' | '';
      time_range: {
        published_at: string;
        ended_at: string;
      }[];
      widget: any[];
    }[];
  };
};

export const OptionalBlockList = ({ blok }: OptionalBlockListProps) => {
  const userLoginStatus = useSelector(selectedActiveUser);

  // 找到第一个符合条件的 item
  const firstMatchedItem = blok.list.find((item) => {
    let shouldDisplayRelativeWithTimeRange = true;
    let shouldDisplayRelativeWithLoginStatus = true;

    // 如果时间范围存在且未过期，则显示组件
    if (item.time_range.length > 0 && isOutdated(item.time_range[0].published_at, item.time_range[0].ended_at)) {
      shouldDisplayRelativeWithTimeRange = false;
    }

    // 如果登录状态为 logged_in_or_out
    if (item.login_status === 'logged_in_or_out' || item.login_status === '') {
      shouldDisplayRelativeWithLoginStatus = true;
    }

    // 如果登录状态为 logged_in
    if (item.login_status === 'logged_in') {
      if (userLoginStatus) {
        shouldDisplayRelativeWithLoginStatus = true;
      } else {
        shouldDisplayRelativeWithLoginStatus = false;
      }
    }

    // 如果登录状态为 logged_out
    if (item.login_status === 'logged_out') {
      if (!userLoginStatus) {
        shouldDisplayRelativeWithLoginStatus = true;
      } else {
        shouldDisplayRelativeWithLoginStatus = false;
      }
    }

    return shouldDisplayRelativeWithTimeRange && shouldDisplayRelativeWithLoginStatus;
  });

  // 如果找到符合条件的 item，渲染它的 widgets
  if (firstMatchedItem) {
    return firstMatchedItem.widget.map((widget) => {
      return <StoryblokServerComponent blok={widget} key={widget._uid} />;
    });
  }

  return null;
};
