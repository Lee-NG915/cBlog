'use client';

import React from 'react';
import { Typography, List, ListItem, Link, useBreakpoints, Container } from '@castlery/fortress';
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { useSearchParams } from 'next/navigation';
import { FortressImage } from '@castlery/shared-components';

const BlogRecommendation = ({ selectorName }: { selectorName: string }) => {
  const dyApiPreview = useSearchParams().get('dyApiPreview') || '';

  const { mobile, tablet, desktop } = useBreakpoints();

  const campaign = useGetDyCampaignsQuery(
    {
      campaignNames: [selectorName || ''],

      query: { dyApiPreview },
    },
    { skip: !selectorName }
  );

  const calcPadding = (i: number, position: 'left' | 'right' | 'top' | 'bottom') => {
    const calcI = i % (desktop ? 4 : 2);
    if (mobile) {
      return 0;
    }
    if (tablet) {
      if (calcI === 0) {
        return position === 'left' ? 0 : '24px';
      }
      if (calcI === 1) {
        return position === 'right' ? 0 : '24px';
      }
    }
    if (desktop) {
      if (calcI === 0) {
        return 0;
      }
      if (calcI === 1) {
        return '24px';
      }
      if (calcI === 2) {
        return '24px';
      }
      if (calcI === 3) {
        return 0;
      }
    }
  };

  if (campaign.status === 'fulfilled') {
    const blogData = campaign.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.slots;
    if (Array.isArray(blogData) && blogData.length > 0) {
      return (
        <Container
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            marginTop: {
              xs: 5,
              md: 10,
            },
            marginBottom: 5,
          }}
        >
          <Typography
            level="h2"
            sx={{
              marginBottom: 3,
            }}
          >
            Recommended Reads for You
          </Typography>
          <List
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                md: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: {
                xs: 3,
                md: 4,
              },
              alignItems: 'stretch',
              paddingTop: 0,
              paddingLeft: '16px',
              paddingRight: '16px',
              ...(desktop && {
                paddingLeft: '24px',
                paddingRight: '24px',
              }),
            }}
          >
            {blogData?.map((item, index) => {
              const { name, url, image_url } = item.productData;
              return (
                <ListItem
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    padding: 0,
                  }}
                >
                  <Link
                    href={url}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      textDecoration: 'none !important',
                      height: '100%',
                      div: {
                        width: '100%',
                      },
                      '&:hover': {
                        textDecoration: 'none !important',
                      },
                    }}
                  >
                    <FortressImage src={image_url} objectFit="cover" ratio={16 / 9} alt={`Recommended Read ${name}`} />
                    <Typography
                      level="h3"
                      sx={{
                        marginTop: '5px',
                      }}
                    >
                      {name}
                    </Typography>
                  </Link>
                </ListItem>
              );
            })}
          </List>
        </Container>
      );
    }
  }

  return null;
};

export { BlogRecommendation };
