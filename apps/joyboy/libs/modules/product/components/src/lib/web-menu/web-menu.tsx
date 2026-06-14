'use client';

import { EcEnv } from '@castlery/config';
import { Box, Link, List, ListItem, Stack, Typography, Container, useBreakpoints } from '@castlery/fortress';
import { RightArrow } from '@castlery/fortress/Icons';
import { isOutdated } from '@castlery/modules-cms-services';
import { CustomLink, FortressImage, NextFortressLink } from '@castlery/shared-components';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { EVENT_GENERAL_LINK_CLICK } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

type MenuItemWrapperProps = {
  displayName: string;
  highlight?: boolean;
  handleMouse?: (displayName?: string) => void;
  mainLink: string;
  showName?: string;
};

interface MenuLink {
  name: string;
  link: string;
  image?: string;
}

type PanelInfoProps = {
  displayName: string;
  leftList: MenuLink[];
  middleList: MenuLink[];
  rightList: MenuLink[];
};

export interface CMSOriginalMenuDataItemType {
  name: string;
  url: string;
  children: {
    name: string;
    url: string;
  }[];
}

export interface CMSOuterMenuDataItemBlockType {
  image_url: string;
  title: string;
  link: string;
  published_at: string;
  ended_at: string;
}

export interface CMSOuterMenuDataItemType {
  slug: string;
  blocks: CMSOuterMenuDataItemBlockType[];
  disable?: boolean;
}

const MenuItemWrapper = ({ displayName, highlight, handleMouse, mainLink, showName }: MenuItemWrapperProps) => {
  const [borderHighlight, setBorderHighlight] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const handleLinkClick = (name: string, link: string) => {
    const prefix = `https://${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`;
    dispatch(
      EVENT_GENERAL_LINK_CLICK({
        category: 'link_click',
        label: 'primary_menu',
        link: name,
        dimension5: `${prefix}${link}`,
      })
    );
  };
  return (
    <ListItem
      sx={[
        {
          padding: '0 12px',
        },
        {
          position: 'relative',
          cursor: mainLink !== '' ? 'pointer' : 'default',
          a: {
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textDecoration: 'none',
            position: 'relative',
            '&:hover': {
              span: {
                textDecoration: 'none',
                color: (theme) => theme.palette.brand.burntOrange[600],
              },
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: (theme) => (borderHighlight ? theme.palette.brand.burntOrange[600] : 'transparent'),
            },
          },
        },
      ]}
      onClick={() => handleLinkClick(showName || displayName, mainLink || '')}
      onMouseEnter={() => {
        if (handleMouse) {
          setBorderHighlight(true);
          handleMouse(displayName);
        }
      }}
      onMouseLeave={() => {
        if (handleMouse) {
          setBorderHighlight(false);
          handleMouse();
        }
      }}
    >
      <CustomLink linkKey={mainLink !== '' ? mainLink : undefined} prefetch={false}>
        <Typography
          level="body1"
          sx={{
            color: (theme) =>
              highlight ? theme.palette.brand.burntOrange[500] : theme.palette.brand.maroonVelvet[500],
            textDecoration: 'none',
            fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
          }}
        >
          {showName || displayName}
        </Typography>
      </CustomLink>
      {/* <Typography
        sx={{
          ...(highlight && {
            color: (theme) => theme.palette.brand.terracotta[500],
          }),
        }}
      >
        {displayName}
      </Typography> */}
    </ListItem>
  );
};

const specialMenuItems = ['New', 'Design Tools', 'Sale'];

type WebMenuProps = {
  cmsOriginalData: { children: CMSOriginalMenuDataItemType[] };
  cmsOuterMenuData: { children: CMSOuterMenuDataItemType[] };
  currentSalePages: any[];
  needHideNew: boolean;
  needHideSale: boolean;
};

const WebMenu: React.FC<WebMenuProps> = ({
  cmsOriginalData,
  cmsOuterMenuData,
  currentSalePages,
  needHideNew,
  needHideSale,
}) => {
  const [panelInfo, setPanelInfo] = useState<PanelInfoProps>();
  const [saleHasShow, setSaleHasShow] = useState<boolean>(false);
  const [saleName, setSaleName] = useState('Sale');
  const inPanelExtendRef = useRef<boolean>(false);
  const menuHideTimerRef = useRef<number>();
  const router = useRouter();

  const dispatch = useAppDispatch();

  const { lg, xl } = useBreakpoints();

  useEffect(() => {
    if (currentSalePages.length > 0) {
      let hasFind = false;
      currentSalePages.forEach((item) => {
        if (item.key === 'sale' && !isOutdated(item.published_at, item.ended_at) && !hasFind) {
          setSaleName(item.name);
          hasFind = true;
        }
      });
    }
  }, [currentSalePages]);

  const menuShowTimerRef = useRef<number>();
  const customSort = (arr) => {
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
  const handlePanelInfo = (displayName?: string) => {
    if (!displayName) {
      if (!inPanelExtendRef.current) {
        if (menuHideTimerRef.current) {
          window.clearTimeout(menuHideTimerRef.current);
          menuHideTimerRef.current = 0;
        }
        menuHideTimerRef.current = window.setTimeout(() => {
          if (!inPanelExtendRef.current) {
            setPanelInfo(undefined);
          }
        }, 200);
      }
    } else {
      if (menuHideTimerRef.current) {
        window.clearTimeout(menuHideTimerRef.current);
        menuHideTimerRef.current = 0;
      }
      // inPanelExtendRef.current = true;
      const tempMiddleList: MenuLink[] = [];
      if (displayName === 'Sale') {
        setSaleHasShow(true);
        cmsOuterMenuData?.children.forEach((item: CMSOuterMenuDataItemType) => {
          if (item.slug === 'sale-text') {
            item.blocks.forEach((block) => {
              if (!isOutdated(block.published_at, block.ended_at)) {
                tempMiddleList.push({
                  name: block.title,
                  link: block.link,
                  image: block.image_url,
                });
              }
            });
          }
        });
      } else {
        setSaleHasShow(false);
      }
      const tempLeftList: MenuLink[] = [];
      let tempRightList: MenuLink[] = [];
      if (specialMenuItems.includes(displayName)) {
        if (displayName === 'New') {
          cmsOuterMenuData?.children.forEach((item: CMSOuterMenuDataItemType) => {
            if (item.slug === 'new-category') {
              item.blocks.forEach((block) => {
                tempLeftList.push({
                  name: block.title,
                  link: block.link,
                  image: block.image_url,
                });
              });
            }
          });
        } else if (displayName === 'Design Tools') {
          cmsOuterMenuData?.children.forEach((item: CMSOuterMenuDataItemType) => {
            if (item.slug === 'design-category') {
              item.blocks.forEach((block) => {
                tempLeftList.push({
                  name: block.title,
                  link: block.link,
                  image: block.image_url,
                });
              });
            }
          });
        } else if (displayName === 'Sale') {
          cmsOuterMenuData?.children.forEach((item: CMSOuterMenuDataItemType) => {
            if (item.slug === 'sale-category') {
              item.blocks.forEach((block) => {
                tempLeftList.push({
                  name: block.title,
                  link: block.link,
                  image: block.image_url,
                });
              });
            }
          });
        }
      } else {
        cmsOriginalData?.children.forEach((item: CMSOriginalMenuDataItemType) => {
          if (item.name === displayName) {
            tempLeftList.push({
              name: `All ${item.name}`,
              link: item.url,
            });
            item?.children.forEach((child: any) => {
              tempLeftList.push({
                name: child.name,
                link: child.url,
              });
            });
          }
        });
      }

      cmsOuterMenuData?.children.forEach((item: CMSOuterMenuDataItemType) => {
        if (item.slug === displayName.toLowerCase()) {
          item.blocks.forEach((block) => {
            tempRightList.push({
              name: block.title,
              link: block.link,
              image: block.image_url,
            });
          });
        } else if (displayName === 'Design Tools' && item.slug === 'design-tools') {
          item.blocks.forEach((block) => {
            tempRightList.push({
              name: block.title,
              link: block.link,
              image: block.image_url,
            });
          });
        } else if (displayName === 'Furniture Sets' && item.slug === 'furniture-sets') {
          item.blocks.forEach((block) => {
            tempRightList.push({
              name: block.title,
              link: block.link,
              image: block.image_url,
            });
          });
        } else if (displayName === 'Outdoor Furniture' && item.slug === 'outdoor') {
          item.blocks.forEach((block) => {
            tempRightList.push({
              name: block.title,
              link: block.link,
              image: block.image_url,
            });
          });
        }
      });
      tempRightList = tempRightList.slice(0, 3);
      if (panelInfo) {
        // setPanelInfo(undefined);
        if (menuShowTimerRef.current) {
          window.clearTimeout(menuShowTimerRef.current);
          menuShowTimerRef.current = 0;
        }
        menuShowTimerRef.current = window.setTimeout(() => {
          setPanelInfo({
            displayName: displayName,
            leftList: customSort(tempLeftList),
            middleList: tempMiddleList,
            rightList: tempRightList,
          });
        }, 200);
      } else {
        window.setTimeout(() => {
          setPanelInfo({
            displayName: displayName,
            leftList: customSort(tempLeftList),
            middleList: tempMiddleList,
            rightList: tempRightList,
          });
        }, 0);
      }
    }
  };

  const handleLinkClick = (link: string, name: string) => {
    const prefix = `https://${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`;
    dispatch(
      EVENT_GENERAL_LINK_CLICK({
        category: 'link_click',
        label: 'primary_sub_menu',
        link: name,
        dimension5: `${prefix}${link}`,
      })
    );
    // const decorateLink = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${link}`;
    // e.preventDefault();
    // e.stopPropagation();
    // if (window?.dataLayer) {
    //   const origin = window?.location?.origin;
    //   const decorateLink = `${origin}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${link}`;
    //   dispatch(
    //     EVENT_GENERAL_LINK_CLICK({
    //       category: 'link_click',
    //       label: 'secondary_menu',
    //       link: name,
    //       dimension5: decorateLink,
    //     })
    //   );
    // }
    // setTimeout(() => {
    //   router.push(decorateLink);
    //   // window.location.href = decorateLink;
    // }, 500);
  };

  return (
    <>
      <List
        sx={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          width: '100%',
          paddingBottom: 0,
          paddingTop: 0,
          overflow: 'auto',
          WebkitOverflowScrolling: {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {!needHideNew && (
          <MenuItemWrapper
            displayName="New"
            mainLink="new"
            handleMouse={(displayName) => {
              handlePanelInfo(displayName);
              if (!displayName) {
                window.setTimeout(() => {
                  inPanelExtendRef.current = false;
                }, 200);
              }
            }}
          />
        )}
        {cmsOriginalData?.children?.map((item: any, i: number) => (
          <MenuItemWrapper displayName={item.name} key={i} handleMouse={handlePanelInfo} mainLink={item.url} />
        ))}
        <MenuItemWrapper displayName="Design Tools" showName="Tools" handleMouse={handlePanelInfo} mainLink="" />
        {!needHideSale && (
          <MenuItemWrapper
            displayName="Sale"
            highlight
            handleMouse={handlePanelInfo}
            mainLink="sale"
            showName={saleName}
          />
        )}
      </List>
      {panelInfo && (
        <Box
          sx={[
            {
              position: 'absolute',
              visibility: 'hidden',
              opacity: 0,
              top: '100%',
              left: '0',
              width: 'calc(100% + 1px)',
              backgroundColor: (theme) => theme.palette.brand.warmLinen[400],
              zIndex: 10,
              padding: '40px 32px',
              animation: '400ms 200ms normal forwards cubic-bezier(0.25, 0.1, 0.25, 1) slideInDown',
              '@keyframes slideInDown': {
                from: {
                  transform: 'translateY(-10px)',
                  visibility: 'hidden',
                  opacity: 0,
                },
                to: {
                  transform: 'translateY(0)',
                  opacity: 1,
                  visibility: 'visible',
                },
              },
            },
          ]}
          onMouseEnter={() => {
            if (menuHideTimerRef.current) {
              window.clearTimeout(menuHideTimerRef.current);
              menuHideTimerRef.current = 0;
            }
            inPanelExtendRef.current = true;
          }}
          onMouseLeave={() => {
            inPanelExtendRef.current = false;
            if (menuHideTimerRef.current) {
              window.clearTimeout(menuHideTimerRef.current);
              menuHideTimerRef.current = 0;
            }
            menuHideTimerRef.current = window.setTimeout(() => {
              if (!inPanelExtendRef.current) {
                setPanelInfo(undefined);
              }
            }, 200);
          }}
        >
          <Container disableGutters>
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Stack
                sx={{
                  width: saleHasShow ? '20%' : '40%',
                  height: 'fit-content',
                  ...(!lg &&
                    !xl &&
                    !saleHasShow && {
                      width: '20%',
                    }),
                }}
              >
                <Typography
                  level="h4"
                  sx={(theme) => ({
                    fontSize: 24,
                    lineHeight: '120%',
                    marginBottom: theme.spacing(6),
                  })}
                >
                  {panelInfo?.displayName === 'Design Tools' ? 'Tools' : panelInfo?.displayName}
                </Typography>
                <List
                  sx={[
                    {
                      display: 'flex',
                      flexDirection: 'column',
                      flexWrap: 'wrap',
                      paddingBottom: 0,
                    },
                    (lg || xl) && {
                      flexDirection: 'row',
                    },
                    saleHasShow && {
                      flexDirection: 'column',
                      flexWrap: 'no-wrap',
                      maxHeight: 'none',
                    },
                  ]}
                >
                  {panelInfo?.leftList.map((item, i) => {
                    return (
                      <ListItem
                        key={i}
                        sx={[
                          {
                            padding: 0,
                            maxHeight: '22px !important',
                            minHeight: '22px !important',
                            height: '22px !important',
                            marginBottom: '16px',
                            width: 240,
                          },
                          !saleHasShow && {
                            maxWidth: '50%',
                          },
                        ]}
                      >
                        <Stack
                          sx={{
                            a: {
                              display: 'block',
                              color: (theme) => theme.palette.brand.maroonVelvet[500],
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              width: 240,
                              height: '22px',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                              fontSize: '16px',
                              span: {
                                width: 'fit-content',
                              },
                              '&:hover': {
                                textDecoration: 'none',
                                color: (theme) => theme.palette.brand.burntOrange[600],
                              },
                            },
                          }}
                          onClick={(e) => handleLinkClick(item.link, item.name)}
                        >
                          <CustomLink linkKey={item.link} prefetch={false}>
                            {item.name}
                          </CustomLink>
                        </Stack>
                        {/* <Link
                        href={item.link}
                        sx={{
                          display: 'block',
                          color: (theme) => theme.palette.brand.charcoal[800],
                          marginBottom: 1.5,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: 208,
                          fontSize: '0.875rem',
                          // maxWidth: '23ch',
                          '&:hover': {
                            textDecoration: 'none',
                            color: (theme) => theme.palette.brand.terracotta[500],
                          },
                        }}
                      >
                        {item.name}
                      </Link> */}
                      </ListItem>
                    );
                  })}
                </List>
              </Stack>
              {saleHasShow && (
                <Stack
                  sx={{
                    width: saleHasShow ? '20%' : '40%',
                  }}
                >
                  <Typography
                    level="h4"
                    sx={{
                      fontSize: 24,
                      lineHeight: 1,
                      marginBottom: 6,
                      color: (theme) => theme.palette.brand.charcoal[800],
                    }}
                  >
                    Limited Time Offers
                  </Typography>
                  <List
                    sx={[
                      {
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        // maxHeight: '100px',
                        paddingBottom: 0,
                      },
                      saleHasShow && {
                        flexDirection: 'column',
                        flexWrap: 'no-wrap',
                        maxHeight: 'none',
                      },
                    ]}
                  >
                    {panelInfo.middleList.map((item, i) => (
                      <ListItem
                        key={i}
                        sx={[
                          {
                            paddingLeft: 0,
                            maxHeight: 4,
                          },
                          !saleHasShow && {
                            width: '50%',
                          },
                        ]}
                      >
                        <NextFortressLink
                          href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${item.link}`}
                          sx={{
                            display: 'block',
                            marginBottom: 1.5,
                            color: (theme) => theme.palette.brand.maroonVelvet[500],
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: 240,
                            textDecoration: 'none',
                            // maxWidth: '23ch',
                            '&:hover': {
                              textDecoration: 'none',
                              color: (theme) => theme.palette.brand.burntOrange[800],
                            },
                          }}
                        >
                          <Typography level="body2">{item.name}</Typography>
                        </NextFortressLink>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              )}
              <Stack
                sx={{
                  width: '60%',
                  ...(!lg &&
                    !xl &&
                    !saleHasShow && {
                      width: '75%',
                    }),
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}
                >
                  {panelInfo?.rightList.map((item, i) => (
                    <Link
                      sx={{
                        width: '32%',
                        minWidth: '180px',
                        maxWidth: '300px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginRight: i === panelInfo?.rightList.length - 1 ? 0 : '1rem',
                        // border: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'none',
                          div: {
                            color: (theme) => theme.palette.brand.charcoal[0],
                            backgroundColor: (theme) => theme.palette.brand.terracotta[500],
                            textDecoration: 'none',
                            svg: {
                              fill: (theme) => theme.palette.brand.charcoal[0],
                            },
                            span: {
                              color: (theme) => theme.palette.brand.charcoal[0],
                            },
                          },
                        },
                        // position: 'relative',
                        // height: '180px'
                      }}
                      key={i}
                      href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${item.link}`}
                      onClick={(e) => handleLinkClick(item.link, item.name)}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          paddingTop: '67%',
                          position: 'relative',
                        }}
                      >
                        <FortressImage
                          objectFit="cover"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                          }}
                          src={item.image || ''}
                          alt={item.name}
                          ratio={16 / 9}
                          sizes={['0.2-md']}
                        />
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          flex: 1,
                          padding: '15px 12px',
                          color: (theme) => theme.palette.brand.terracotta[500],
                          border: (theme) => `1px solid ${theme.palette.brand.terracotta[500]}`,
                          // borderTop: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
                          '&:hover': {
                            color: (theme) => theme.palette.brand.warmLinen[500],
                            backgroundColor: (theme) => theme.palette.brand.terracotta[500],
                            textDecoration: 'none',
                            svg: {
                              fill: (theme) => theme.palette.brand.warmLinen[500],
                            },
                            span: {
                              color: (theme) => theme.palette.brand.warmLinen[500],
                            },
                          },

                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          // maxHeight: '45px'
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '16px !important',
                            lineHeight: '20px',
                          }}
                        >
                          {item.name}
                        </Typography>
                        <RightArrow
                          sx={{
                            width: '26px',
                            marginLeft: '15px',
                            fill: (theme) => theme.palette.brand.terracotta[500],
                            // stroke: (theme) => theme.palette.brand.wheat[500],
                          }}
                        />
                      </Box>
                    </Link>
                  ))}
                </Box>
              </Stack>
            </Stack>
          </Container>
        </Box>
      )}
    </>
  );
};

export { WebMenu };
