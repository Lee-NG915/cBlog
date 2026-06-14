import React, { useState, useEffect } from 'react';
import { Stack } from 'fortress';
import { ReviewContent } from '../ReviewContent/ReviewContent';
import { ReviewInfo } from '../ReviewInfo/ReviewInfo';
import useBreakpoints from 'fortress/hooks/useBreakpoints/useBreakpoints';
import ReviewDate from '../ReviewDate/ReviewDate';
import { GlobalReviewListItemType } from 'fortress/GlobalReview/types/types';

type ReviewListProps = {
  list: GlobalReviewListItemType[];
  isInInfinite?: boolean;
  needRefresh?: boolean;
};

const ReviewList = ({ list, isInInfinite, needRefresh }: ReviewListProps) => {
  const { mobile } = useBreakpoints();
  const [realList, setRealList] = useState<GlobalReviewListItemType[]>([]);
  useEffect(() => {
    if (mobile && list) {
      if (realList.length === 0 || needRefresh) {
        setRealList(list);
      } else {
        setRealList(realList.concat(list));
      }
    }
  }, [list, mobile]);
  if (!list || list.length === 0) {
    return null;
  }
  if (!mobile) {
    return (
      <Stack
        sx={() => ({
          width: '100%',
          padding: '0 20px',
        })}
      >
        {list.map((item, index) => {
          return (
            <Stack
              sx={() => ({
                display: 'flex',
                flexDirection: 'row',
                marginBottom: 7,
              })}
              key={index}
            >
              <ReviewInfo {...item.info} />
              <ReviewContent {...item.content} />
            </Stack>
          );
        })}
      </Stack>
    );
  }
  return (
    <Stack
      sx={() => ({
        width: '100%',
        padding: !isInInfinite ? '0 20px' : '0 20px 0 0',
      })}
    >
      {isInInfinite &&
        realList.map((item, index) => {
          return (
            <Stack
              sx={() => ({
                marginBottom: 4,
              })}
            >
              <Stack
                sx={() => ({
                  display: 'flex',
                  flexDirection: 'row',
                  marginBottom: mobile ? 2 : 7,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
                key={index}
              >
                <ReviewInfo {...item.info} />
                <ReviewDate date={item.content.createdAt} location={item.info.location} />
              </Stack>
              <ReviewContent {...item.content} />
            </Stack>
          );
        })}
      {!isInInfinite &&
        list.map((item, index) => {
          return (
            <Stack
              sx={() => ({
                marginBottom: 4,
              })}
            >
              <Stack
                sx={() => ({
                  display: 'flex',
                  flexDirection: 'row',
                  marginBottom: mobile ? 2 : 7,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
                key={index}
              >
                <ReviewInfo {...item.info} />
                <ReviewDate date={item.content.createdAt} location={item.info.location} />
              </Stack>
              <ReviewContent {...item.content} />
            </Stack>
          );
        })}
    </Stack>
  );
};

export { ReviewList, ReviewListProps };
