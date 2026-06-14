'use server';
import { getReviewListByPage } from '../api/review/review.api';

const getReviewList = async (makeStore: any, page: number, per_page: number) => {
  const wrapperGetReviewList = async () => {
    const store = makeStore();
    const result = await store.dispatch(getReviewListByPage({ page, per_page }));
    if (result?.error) {
      throw new Error(result);
    }
    return result?.payload;
  };
  return await wrapperGetReviewList();
};

export { getReviewList, getReviewListByPage };
