import React, { useState, useEffect } from 'react';
import { Stack, Typography, Button, useBreakpoints } from '@castlery/fortress';
import { sbApiClient } from '@castlery/modules-cms-components';
import { BlogListType } from '../../page.client';

interface BlogPaginationProps {
  onListUpdate: (res: BlogListType[]) => void;
}

const BlogPagination = ({ onListUpdate }: BlogPaginationProps) => {
  const { mobile, desktop } = useBreakpoints();
  const [page, setPage] = useState(1);
  const [needLoadMore, setNeedLoadMore] = useState(true);
  const [fakeLoading, setFakeLoading] = useState(false);

  const updateBlogList = () => {
    sbApiClient
      .getBlogPostsOnClient({
        page,
      })
      .then((res) => {
        setFakeLoading(false);
        if (res.length < 9) {
          setNeedLoadMore(false);
        }
        onListUpdate(res);
      });
  };

  useEffect(() => {
    if (page > 1) {
      setFakeLoading(true);
      setTimeout(() => {
        updateBlogList();
      }, 1000);
    }
  }, [page]);

  return (
    <Stack
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        mb: '60px',
        ...(!desktop && { mb: '38px' }),
      }}
    >
      {needLoadMore ? (
        <Button variant="primary" onClick={() => setPage(page + 1)} loading={fakeLoading}>
          Load More
        </Button>
      ) : (
        <Stack
          sx={{
            position: 'relative',
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '150px',
              height: 0,
              borderTop: '1px solid #888',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
            },
          }}
        >
          <Typography
            sx={{
              position: 'absolute',
              zIndex: 2,
              color: '#888',
              padding: '0 10px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#FBF9F4',
              width: '90px',
            }}
          >
            The End
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default BlogPagination;
