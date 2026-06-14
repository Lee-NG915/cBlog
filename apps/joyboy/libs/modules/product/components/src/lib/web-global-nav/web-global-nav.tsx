'use client';

import React from 'react';
import { Container, Link, List, ListItem, selectClasses, Typography, useBreakpoints, Stack } from '@castlery/fortress';
import { CountrySelector } from '../footer/components/country-selector/country-selector';
import { LinkItemStoryblok } from '@castlery/types';
import { EVENT_GENERAL_LINK_CLICK } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { CustomLink } from '@castlery/shared-components';

type WebGlobalNavProps = {
  globalNavData: LinkItemStoryblok[];
};

export const WebGlobalNav: React.FC<WebGlobalNavProps> = ({ globalNavData }) => {
  const { desktop } = useBreakpoints();
  const dispatch = useAppDispatch();
  if (!desktop) {
    return null;
  }
  const handleLinkClick = (link: string, name: string) => {
    dispatch(
      EVENT_GENERAL_LINK_CLICK({ category: 'link_click', label: 'secondary_menu', link: name, dimension5: link })
    );
  };
  return (
    <Container
      sx={{
        height: 40,
        backgroundColor: (theme) => theme.palette.brand.warmLinen[500],
        maxWidth: '100vw !important',
        display: {
          xs: 'none',
          md: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <List
        sx={{
          maxHeight: 40,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 0,
          maxWidth: 1728,
          '& > div': {
            paddingRight: '0 !important',
          },
          button: {
            fontSize: '16px !important',
          },
        }}
      >
        {globalNavData?.map((item, index) => {
          return (
            <ListItem
              key={index}
              sx={[
                {
                  padding: '8px !important',
                },
              ]}
            >
              <Stack
                sx={(theme) => ({
                  a: {
                    color: theme.palette.brand.maroonVelvet[500],
                    textDecoration: 'none',
                  },
                })}
                onClick={() => handleLinkClick(item.link.url, item.name)}
              >
                <CustomLink linkKey={item.link.url} prefetch={false}>
                  <Typography level="caption1" sx={{ fontSize: '16px !important' }}>
                    {item.name}
                  </Typography>
                </CustomLink>
              </Stack>
              {/* <Link
                role="button"
                href={item.link.url}
                target={item.link.target || '_self'}
                data-category="link_click"
                data-action="secondary_menu"
                data-label={item.name}
                onClick={(e) => handleLinkClick(e, item.link.url, item.name)}
                sx={(theme) => ({
                  color: theme.palette.brand.maroonVelvet[500],
                  textDecoration: 'none',
                })}
              >
                <Typography level="caption1" sx={{ fontSize: '16px !important' }}>
                  {item.name + `url: ${item.link.url}`}
                </Typography>
              </Link> */}
            </ListItem>
          );
        })}
        <CountrySelector
          showIcon={false}
          size="sm"
          inFooter={false}
          sx={(theme) => ({
            ...theme.typography.caption1,
            // maxWidth: '110px',
            color: theme.palette.brand.maroonVelvet[500],
            [`& .${selectClasses.button}`]: {
              justifyContent: 'flex-start',
              color: theme.palette.brand.maroonVelvet[500],
            },
            padding: 0,
            marginLeft: 2,
            // marginRight: 3,
          })}
        />
      </List>
    </Container>
  );
};

export default WebGlobalNav;
