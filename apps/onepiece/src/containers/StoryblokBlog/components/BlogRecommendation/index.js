import React from 'react';
import { useApiCampaigns } from 'hooks/dy';
import { Stack, Typography, List, ListItem, Link, useBreakpoints } from '@castlery/fortress';
import ReactPicture from 'components/ReactPicture';

const BlogRecommendation = ({ selector }) => {
  const recommendationInfo = useApiCampaigns({
    selectorArray: [selector],
    pageType: 'product',
    shouldCheckIfNeedLoad: false,
  })?.[selector]?.data?.slots;

  const { mobile, tablet } = useBreakpoints();

  if (!recommendationInfo) {
    return null;
  }

  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        marginBottom: 5,
      }}
    >
      <Typography
        sx={{
          fontFamily: 'MinervaModern',
          fontSize: mobile ? 24 : 32,
          lineHeight: '150%',
          fontWeight: 400,
          marginBottom: 3,
        }}
      >
        Recommended Reads for You
      </Typography>
      <List
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingTop: 0,
        }}
      >
        {recommendationInfo?.map((item, index) => {
          const { name, url, image_url } = item.productData;
          return (
            <ListItem
              key={index}
              sx={{
                width: mobile ? '100%' : tablet ? '50%' : '25%',
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: 3,
                paddingTop: 0,
                paddingBottom: 0,
              }}
            >
              <Link
                href={url}
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  div: {
                    width: '100%',
                  },
                  '&:hover': {
                    textDecoration: 'none',
                  },
                }}
              >
                <ReactPicture
                  srcset={image_url}
                  loader={{
                    ratio: 9 / 16,
                    objectFit: 'cover',
                  }}
                  alt={`Recommended Read ${name}`}
                />
                <Typography
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: mobile ? 16 : 18,
                    lineHeight: '175%',
                    fontWeight: 400,
                    width: '90%',
                    textOverflow: 'clip',
                    whiteSpace: 'normal',
                    marginTop: '5px',
                    color: '#333',
                  }}
                >
                  {name}
                </Typography>
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
};

export default BlogRecommendation;
