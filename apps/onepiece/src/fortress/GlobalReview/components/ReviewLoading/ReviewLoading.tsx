import Spinner from 'components/Spinner';
import * as React from 'react';
import { styled } from '@mui/joy';
// import useGlobalReview from '../../hooks/useGlobalReview';
import { GlobalReviewListItemType } from '../../types/types';

// const LoadingDiv = styled('div')`
//    {
//     position: absolute;
//     background-color: rgba(255, 255, 255, 0.8);
//     left: 0;
//     top: 0;
//     width: 100%;
//     height: 100%;
//   }
// `;
type ReviewLoadingType = {
  list: GlobalReviewListItemType[];
};
const ReviewLoading = ({ list }: ReviewLoadingType) => {
  // const { reviewListData } = useGlobalReview();

  return (
    // <LoadingDiv>
    <Spinner
      style={{
        position: 'absolute',
        top: !list || list.length === 0 ? '67%' : '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
    // </LoadingDiv>
  );
};

export default ReviewLoading;
