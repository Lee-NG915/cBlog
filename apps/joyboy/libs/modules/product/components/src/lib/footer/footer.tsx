'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Container,
  Divider,
  List,
  ListItem,
  ListSubheader,
  Stack,
  Typography,
  linkClasses,
  listClasses,
  listItemButtonClasses,
  listItemClasses,
  listSubheaderClasses,
  selectClasses,
  typographyClasses,
} from '@castlery/fortress';
import { CustomLink, FortressImage } from '@castlery/shared-components';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import FooterSubscription from './components/FooterSubscription/footerSubscription';
import Social from './components/Social/social';
import { getDate } from '@castlery/modules-cms-services';
import { CountrySelector } from './components/country-selector/country-selector';
import { EcEnv } from '@castlery/config';
import type { FooterListV2Storyblok, KeyValueV2Storyblok, SocialListItemV2Storyblok } from '@castlery/types';
import { CustomerReview } from '../customer-review/customer-review';

const customSort = (arr: any[]) => {
  const len = arr.length;
  const result = new Array(len);
  const mid = Math.ceil(len / 2);
  for (let i = 0; i < mid; i++) {
    result[i * 2] = arr[i];
  }
  for (let i = mid; i < len; i++) {
    result[(i - mid) * 2 + 1] = arr[i];
  }
  return result;
};

type FooterDesktopContentProps = {
  footerData: FooterListItemProps[];
  socialList: SocialItemProps[];
  handleAccessibilityTool: () => void;
  newsletterHeaderTitle?: string;
};

type FooterMobileContentProps = {
  footerData: FooterListItemProps[];
  socialList: SocialItemProps[];
  mobileList: FooterListItemProps[];
  handleAccessibilityTool: () => void;
  newsletterHeaderTitle?: string;
};

const footerPalette = {
  color: `var(--fortress-palette-brand-flour-10)`,
  bg: `var( --fortress-palette-brand-terracotta-500)`,
  hoverBg: `var( --fortress-palette-brand-terracotta-500)`,
  activeBg: '',
  disableColor: '',
  disableBg: '',
};

const FooterDesktopContent = ({
  footerData,
  socialList,
  handleAccessibilityTool,
  newsletterHeaderTitle,
}: FooterDesktopContentProps) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={() => ({
        flexGrow: 1,
        [`& .${listSubheaderClasses.root}`]: {
          textTransform: 'none',
        },
        [`& .${listClasses.root}`]: {
          '--ListItem-paddingX': 0,
          '--ListItem-paddingY': 4,
        },
      })}
    >
      {footerData.map((footerListItem, i) => {
        return (
          <List sx={(theme) => ({ flex: 1, gap: theme.spacing(3) })} key={i}>
            <ListSubheader>
              <Typography level="h5">{footerListItem.name}</Typography>
            </ListSubheader>
            {footerListItem?.list[0]?.list?.map((footerItem, index) => {
              if (footerItem.key === 'accessibility-tool') {
                return (
                  <ListItem
                    sx={{
                      a: {
                        textDecoration: 'none !important',
                      },
                      padding: '0 !important',
                      border: '0 !important',
                    }}
                    key={index}
                  >
                    <Typography
                      level="caption1"
                      sx={{
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleAccessibilityTool();
                      }}
                    >
                      Accessibility Tool
                    </Typography>
                  </ListItem>
                );
              }
              return (
                <ListItem
                  sx={{
                    a: {
                      textDecoration: 'none !important',
                    },
                    padding: '0 !important',
                    border: '0 !important',
                  }}
                  key={index}
                >
                  <CustomLink
                    linkKey={footerItem.key}
                    // prefetch={footerItem.value === 'Careers' ? false : true}
                    // isExternalFlag={true}
                  >
                    <Typography
                      level="caption1"
                      sx={{
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {footerItem.value}
                    </Typography>
                  </CustomLink>
                </ListItem>
              );
            })}
          </List>
        );
      })}
      <Stack spacing={7} sx={{ flex: 2 }}>
        <FooterSubscription footerPalette={footerPalette} newsletterHeaderTitle={newsletterHeaderTitle} />
        <Social socialMap={socialList} />
        <FortressImage
          src="https://res.cloudinary.com/castlery/image/upload/v1760341082/CASTLERY_BRANDMARK_RGB_COL_WARMLINEN_DESKTOP_wdnnuf.png"
          alt="castlery brand mark"
          imageWidth={421}
          imageHeight={106}
          ratio={3.97}
        />
      </Stack>
    </Stack>
  );
};

const FooterMobileContent = ({
  footerData,
  socialList,
  mobileList,
  handleAccessibilityTool,
  newsletterHeaderTitle,
}: FooterMobileContentProps) => {
  const [expandedGroup, setExpandedGroup] = useState<boolean[]>([]);
  useEffect(() => {
    if (footerData) {
      const tempArr = new Array(footerData.length).fill(false);
      setExpandedGroup(tempArr);
    }
  }, [footerData]);
  return (
    <>
      <FooterSubscription footerPalette={footerPalette} newsletterHeaderTitle={newsletterHeaderTitle} />
      {footerData.map((footerListItem, index) => {
        const { list, name } = footerListItem;
        return (
          <AccordionGroup
            key={footerListItem?._uid || index}
            sx={{
              margin: index !== 0 ? '0 !important' : '0',
              // padding: '16px 0',
              borderBottom: '0.5px solid #fff',
            }}
          >
            <Accordion
              expanded={expandedGroup[index]}
              onChange={() => {
                const tempArr = [...expandedGroup];
                tempArr[index] = !tempArr[index];
                setExpandedGroup(tempArr);
              }}
            >
              <AccordionSummary
                sx={{
                  padding: '16px 0',
                  button: {
                    fontSize: 16,
                    color: '#fff !important',
                    '&:hover': {
                      color: '#fff !important',
                    },
                    '&:active': {
                      color: '#fff !important',
                    },
                    svg: {
                      fill: '#fff !important',
                      '&:hover': {
                        fill: '#fff !important',
                      },
                      '&:active': {
                        fill: '#fff !important',
                      },
                    },
                  },
                }}
              >
                {name}
              </AccordionSummary>
              <AccordionDetails>
                <List
                  sx={(theme) => ({
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    paddingInlineStart: 0,
                    gap: theme.spacing(3),
                  })}
                >
                  {customSort(list[0].list).map((footerItem, i) => {
                    if (footerItem.key === 'accessibility-tool') {
                      return (
                        <ListItem
                          key={footerItem.key + i}
                          sx={{
                            padding: '0 !important',
                            border: '0 !important',
                            a: {
                              textDecoration: 'none !important',
                            },
                          }}
                        >
                          <Typography
                            level="caption1"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleAccessibilityTool();
                            }}
                          >
                            Accessibility Tool
                          </Typography>
                        </ListItem>
                      );
                    }
                    return (
                      <ListItem
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          padding: '0 !important',
                          border: '0 !important',
                          a: {
                            textDecoration: 'none !important',
                          },
                        }}
                        key={i}
                      >
                        <CustomLink
                          linkKey={footerItem.key}
                          // isExternalFlag={true}
                        >
                          <Typography level="caption1">{footerItem.value}</Typography>
                        </CustomLink>
                      </ListItem>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>
        );
      })}
      <Social socialMap={socialList} />
      <CountrySelector
        showIcon={false}
        size="sm"
        inFooter={true}
        sx={(theme) => ({
          maxWidth: '110px',
          color: footerPalette.color,
          '--fortress-palette-neutral-plainHoverColor': theme.palette.neutral[300],
          '--ListItem-fontSize': theme.fontSize.md,
          '--Select-paddingInline': 0,
          [`& .${selectClasses.button}`]: {
            justifyContent: 'flex-start',
            color: footerPalette.color,
          },
        })}
      />
      <FortressImage
        src="https://res.cloudinary.com/castlery/image/upload/v1760341082/CASTLERY_BRANDMARK_RGB_COL_WARMLINEN_DESKTOP_wdnnuf.png"
        alt="castlery brand mark"
        ratio={3.93}
        sx={{
          width: '100%',
        }}
      />
    </>
  );
};

type FooterItemProps = {
  list: { key: string; value: string }[];
};

type FooterListItemProps = {
  name: string;
  list: [FooterItemProps];
};

export type SocialItemProps = {
  ariaLabel: string;
  icon: string;
  link: string;
};

type FooterProps = {
  footerData: FooterListV2Storyblok[];
  socialList: SocialListItemV2Storyblok[];
  bottomList: KeyValueV2Storyblok[];
  mobileList: FooterListV2Storyblok[];
  newsletterHeaderTitle?: string;
};

export const Footer = ({ footerData, socialList, bottomList, mobileList, newsletterHeaderTitle }: FooterProps) => {
  const isAccessibilityToolLoaded = useRef(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const [isFooterFullyVisible, setIsFooterFullyVisible] = useState(false);

  // IntersectionObserver 来监听 footer 的可见性
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        // 获取更多信息来调试
        const rect = entry.boundingClientRect;
        const viewportHeight = window.innerHeight;
        const footerHeight = rect.height;

        // 更智能的判断逻辑：
        // 1. intersectionRatio 接近 1.0 (>= 0.95)
        // 2. 或者 footer 的底部已经到达视窗底部 (rect.bottom <= viewportHeight + 10px 容差)
        const isFullyVisible = entry.intersectionRatio >= 0.95 || (rect.bottom <= viewportHeight + 10 && rect.top <= 0);

        setIsFooterFullyVisible(isFullyVisible);
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 0.95, 1], // 添加 0.95 阈值
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  // eslint-disable-next-line
  const handleAccessibilityTool = useCallback(() => {
    if (!isAccessibilityToolLoaded.current) {
      const s = document.createElement('script');
      s.setAttribute('data-statement_text', 'Our Accessibility Statement');
      s.setAttribute('data-statement_url', 'https://www.castlery.com/us/accessibility');
      s.setAttribute('data-account', 'L8zGqgSdkF');
      s.setAttribute('src', 'https://cdn.userway.org/widget.js');
      (document.body || document.head).appendChild(s);
      s.onload = function () {
        isAccessibilityToolLoaded.current = true;
      };
      s.onerror = function () {
        isAccessibilityToolLoaded.current = false;
      };
    }
  }, []);

  return (
    <Box
      ref={footerRef}
      component="footer"
      role="contentinfo"
      data-section="footer"
      sx={{
        bgcolor: footerPalette.bg,
      }}
    >
      <CustomerReview isFooterFullyVisible={isFooterFullyVisible} />
      {EcEnv.NEXT_PUBLIC_COUNTRY === 'AU' && (
        <Stack
          sx={{
            width: '100%',
            padding: 3,
            backgroundColor: (theme) => theme.palette.brand.flour[50],
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: {
                xs: '12px',
                md: '14px',
              },
            }}
          >
            Castlery acknowledges Australia's First Nations as the Traditional Custodians of country throughout
            Australia and their connections to land, sea and community.
            <br />
            We pay our respects to their Elders past and present and extend that respect to all Aboriginal and Torres
            Strait Islander peoples today.
          </Typography>
        </Stack>
      )}
      <Container
        sx={(theme) => ({
          padding: { xs: 'auto', md: `${theme.spacing(8)} !important` },
          paddingTop: { xs: theme.spacing(8), md: 'auto' },
          paddingBottom: { xs: theme.spacing(8), md: 'auto' },
          color: theme.palette.brand.warmLinen[500],
          [`& .${typographyClasses.root}, & .${selectClasses.root}`]: {
            color: theme.palette.brand.warmLinen[500],
          },
          [`& .${listSubheaderClasses.root}`]: {
            textTransform: 'normal',
            color: theme.palette.brand.warmLinen[500],
          },
          [`& .${listClasses.root}`]: {
            '--List-padding': 0,

            '--ListItem-minHeight': 0,

            [`& .${listSubheaderClasses.root}`]: {
              fontSize: theme.fontSize.lg,
              lineHeight: 1.5,
              fontWeight: 600,

              '--ListItem-paddingY': 0,
              mb: 2,

              '--fortress-letterSpacing-md': 0,
              fontStyle: 'normal',
            },
            [`& .${listItemClasses.root}`]: {
              // color: 'red',
            },

            // 12px
            '--Typography-fontSize': theme.fontSize.xs,
            [theme.breakpoints.up('sm')]: {
              // 14px
              '--Typography-fontSize': theme.fontSize.sm,
            },
          },
        })}
      >
        <Stack
          sx={(theme) => ({
            // ui  style
            [`& .${listItemClasses.root}`]: {
              '--ListItem-paddingY': '2px',
              [`& .${listItemButtonClasses.root}, & .${linkClasses.root}`]: {
                // list item 的字体大小
                ...theme.typography.h1,
                color: theme.palette.brand.warmLinen[500],
                ':hover': {
                  color: theme.palette.brand.warmLinen[500],
                },
              },
            },
          })}
          spacing={{ xs: 5, lg: 5 }}
          mb={{ xs: 5 }}
        >
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <FooterDesktopContent
              footerData={footerData}
              socialList={socialList}
              handleAccessibilityTool={handleAccessibilityTool}
              newsletterHeaderTitle={newsletterHeaderTitle}
            />
          </Box>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <FooterMobileContent
              footerData={footerData}
              socialList={socialList}
              mobileList={mobileList}
              handleAccessibilityTool={handleAccessibilityTool}
              newsletterHeaderTitle={newsletterHeaderTitle}
            />
          </Box>
        </Stack>
        <Divider
          sx={(theme) => ({
            my: 6,
            '--Divider-lineColor': theme.palette.brand.flour[10],
          })}
        />
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          alignItems="flex-start"
          sx={(theme) => ({
            padding: `${theme.spacing(1)} 0 !important`,
            [`& .${linkClasses.root}`]: {
              ...theme.typography.caption2,
              color: theme.palette.brand.warmLinen[500],
              lineHeight: theme.lineHeight.lg,
            },
          })}
        >
          <List
            orientation="horizontal"
            sx={(theme) => ({
              flexWrap: 'wrap',
              gap: theme.spacing(6),
              rowGap: theme.spacing(3),
              justifyContent: 'flex-start',

              '--Typography-fontSize': theme.fontSize.sm,
              '--ListItem-paddingY': 0,
              [`& .${listItemClasses.root}`]: {
                paddingInlineEnd: 2,
                paddingInlineStart: 0,
              },
            })}
          >
            {bottomList.map((item, index) => {
              if (item.key === 'cookies') {
                return (
                  <ListItem
                    key={item?._uid + index}
                    sx={{
                      padding: `0 !important`,
                      a: {
                        textDecoration: 'none !important',
                      },
                    }}
                  >
                    <Typography
                      onClick={(e) => {
                        e.preventDefault();
                        window?.revisitCkyConsent && window.revisitCkyConsent();
                      }}
                      level="caption1"
                      sx={{
                        // fontSize: '12px',
                        // lineHeight: '35px',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {item.value}
                    </Typography>
                  </ListItem>
                );
              }
              return (
                <ListItem
                  sx={(theme) => ({
                    padding: `0 !important`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    a: {
                      textDecoration: 'none !important',
                    },
                  })}
                  key={index}
                >
                  <CustomLink
                    linkKey={item.key}
                    // prefetch={item.key === 'sitemap' ? false : true}
                    //  isExternalFlag={true}
                  >
                    <Typography
                      level="caption1"
                      sx={{
                        // fontSize: '16px',
                        // lineHeight: '120%',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {item.value}
                    </Typography>
                  </CustomLink>
                </ListItem>
              );
            })}
          </List>
          <Typography
            level="caption1"
            sx={(theme) => ({
              // lineHeight: '200%',
              width: { xs: '100%', md: 'auto' },
              mt: { xs: theme.spacing(4), md: theme.spacing(4), lg: 0 },
            })}
          >
            &copy; {getDate().year()} Castlery. All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
