import * as React from 'react';
import { Box, Stack } from 'fortress';
import ReactPicture from 'components/ReactPicture';
import useBreakpoints from 'fortress/hooks/useBreakpoints/useBreakpoints';

type ReviewImageListProps = {
  imageList: { image_url: string; clickHandler?: () => void }[];
  title: string;
};

const ReviewImageList = ({ imageList, title }: ReviewImageListProps) => {
  const { mobile } = useBreakpoints();
  if (!imageList || imageList.length === 0) {
    return null;
  }
  return (
    <Stack sx={() => ({ display: 'flex', flexDirection: 'row', marginBottom: 3, flexWrap: 'wrap' })}>
      {imageList.map((item, index) => {
        return (
          <div onClick={item.clickHandler}>
            <Box
              key={index}
              sx={() => ({
                width: mobile ? '64px' : '118px',
                height: mobile ? '64px' : '118px',
                marginRight: 3,
                marginBottom: 1,
                cursor: 'pointer',
              })}
            >
              <ReactPicture srcset={item.image_url} loader={{ ratio: 1 }} alt={`review from ${title}`} />
            </Box>
          </div>
        );
      })}
    </Stack>
  );
};

export default ReviewImageList;
