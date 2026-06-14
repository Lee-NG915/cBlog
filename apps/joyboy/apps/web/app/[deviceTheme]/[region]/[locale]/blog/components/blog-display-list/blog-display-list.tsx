import React from 'react';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { CustomLink, FortressImage } from '@castlery/shared-components';
import { BlogListType } from '../../page.client';

interface BlogDisplayListProps {
  realBlogList: BlogListType[];
}

const BlogDisplayList = ({ realBlogList }: BlogDisplayListProps) => {
  const { desktop } = useBreakpoints();
  return (
    <>
      {realBlogList.map((blog: any) => {
        return (
          <Stack
            key={blog.key}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '60px',
              width: !desktop ? '100%' : '33.33%',
              padding: '0 15px',
              ...(!desktop && { padding: '0 24px', mb: '32px' }),
            }}
          >
            <Stack
              sx={{
                width: '100%',
              }}
            >
              <CustomLink href={`blog${blog.url}`}>
                <FortressImage
                  objectFit="cover"
                  src={blog.bannerBackgroundImage}
                  alt={blog.name}
                  sx={{
                    width: '100%',
                  }}
                  ratio={1}
                />
              </CustomLink>
            </Stack>
            <Stack
              sx={{
                a: {
                  textDecoration: 'none',
                  color: (theme) => theme.palette.brand.charcoal[800],
                  fontSize: '22px',
                  textAlign: 'center',
                  marginTop: '32px',
                  ...(!desktop && { marginTop: '20px' }),
                },
              }}
            >
              <CustomLink href={`blog${blog.url}`}>
                <Typography level="h3">{blog.name}</Typography>
              </CustomLink>
            </Stack>
            <Typography
              level="subh2"
              sx={(theme) => ({
                marginTop: theme.spacing(4),
                ...(!desktop && { marginTop: theme.spacing(2), mb: theme.spacing(8) }),
                color: theme.palette.brand.maroonVelvet[500],
              })}
            >
              {blog?.publishedAt}
            </Typography>
          </Stack>
        );
      })}
    </>
  );
};

export default BlogDisplayList;
