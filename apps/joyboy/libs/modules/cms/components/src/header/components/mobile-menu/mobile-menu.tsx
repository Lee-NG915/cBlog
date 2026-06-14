'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  Stack,
  Typography,
  modalCloseClasses,
  useBreakpoints,
} from '@castlery/fortress';
import { Close, MenuMore, Search } from '@castlery/fortress/Icons';
import { ShoppingBagButton, UserMenu } from '@castlery/modules-product-components';
import { WebLOGO } from '@castlery/fortress';
import { CountrySelector } from './components/country-selector/country-selector';
import { CustomLink, FortressImage, getCustomerServiceApi, useCasaEnabled } from '@castlery/shared-components';
import { SearchInput } from '@castlery/modules-product-components';
import { isOutdated } from '@castlery/modules-cms-services';
import { EcEnv, basePageConfig } from '@castlery/config';
import moment from 'moment-timezone';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { cartIconClickedEvent } from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { EVENT_GENERAL_LINK_CLICK } from '@castlery/modules-tracking-services';
import { openMenuCustomerServiceChat } from './mobile-menu-customer-service';

type BlockType = {
  _uid: string;
  title: string;
  link: string;
  image_url: string;
};

// TODO @abbywang23  这里要放在配置里 不让会忘记 添加别的国家
const GLADLY_BUSINESS_HOURS = {
  SG: {
    Weekdays: {
      from: '10:00 AM',
      to: '10:00 PM',
    },
    Weekends: {
      from: '10:00 AM',
      to: '10:00 PM',
    },
  },
  AU: {
    Weekdays: {
      from: '09:30 AM',
      to: '05:00 PM',
    },
    Weekends: {
      from: '10:00 AM',
      to: '06:00 PM',
    },
  },
  US: {
    Weekdays: {
      from: '10:00 AM',
      to: '06:00 PM',
    },
  },
  CA: {
    Weekdays: {
      from: '10:00 AM',
      to: '06:00 PM',
    },
  },
  UK: {
    Weekdays: {
      from: '8:00 AM',
      to: '8:00 PM',
    },
  },
};

type ChatAction = 'casa' | 'whatsapp' | 'gladly';

const getChatConfig = (
  market: string,
  casaEnabled: boolean,
  businessHours: boolean
): { label: string; action: ChatAction } => {
  if (casaEnabled) {
    return { label: 'Chat Online', action: 'casa' };
  }
  if (market === 'SG') {
    return { label: businessHours ? 'Chat Online' : 'Leave a message', action: 'whatsapp' };
  }
  return { label: businessHours ? 'Chat Online' : 'Leave a message', action: 'gladly' };
};

export const MobileMenu = ({ originalMenu, outerMenuData, globalNavData, currentSalePages }) => {
  const filteredOuterMenuData = outerMenuData;
  const [saleName, setSaleName] = useState('Sale');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [chosenIndex, setChosenIndex] = useState(0);
  const [firstClicked, setFirstClicked] = useState(false);

  const dispatch = useAppDispatch();

  const { tablet } = useBreakpoints();
  const activeUser = useAppSelector(selectedActiveUser);
  const isCasaEnabled = useCasaEnabled();

  const removeBgColor = (url: string) => {
    // 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1645672842/crusader/variants/50440748-AM4001/Madison-Left-Chaise-Sectional-Sofa-Bisque-Front.jpg';
    let newUrl = url;

    if (url?.startsWith('https://res.cloudinary.com/')) {
      const reg = /(.*)\/(private|upload)\/(.*?)\/(.*)/;

      newUrl = url.replace(reg, (match, ...args) => {
        args[2] = args[2].replace(/b_rgb:*((?!,).)*/, '');
        return args.splice(0, 4).filter(Boolean).join('/');
      });
    }
    return newUrl;
  };

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
  const globalNavFiltered = useMemo(() => {
    return globalNavData.filter(
      (item: { published_at: string; ended_at: string }[]) => !isOutdated(item.published_at, item.ended_at)
    );
  }, [globalNavData]);
  const findBlocks = useCallback(
    (key: string) => {
      return filteredOuterMenuData?.find((item) => item.slug === key)?.blocks;
    },
    [filteredOuterMenuData]
  );
  const findItem = useCallback(
    (key: string) => {
      return filteredOuterMenuData?.find((item) => item.slug === key);
    },
    [filteredOuterMenuData]
  );
  const categories = useMemo(() => {
    const allSaleCategory = {
      key: 'custom_all-sale',
      name: 'All Sale',
      url: '/sale',
      thumbnail:
        'https://res.cloudinary.com/castlery/image/upload/v1648716501/knight/category/mobile_thumbnail/ALL_AllSale_Mobile.jpg',
      children: [],
    };
    const saleCategory = {
      key: 'custom_sale',
      name: saleName,
      disable: filteredOuterMenuData?.find((item) => item.slug === 'sale')?.disable,
      url: '',
      thumbnail:
        'https://res.cloudinary.com/castlery/image/upload/v1648716501/knight/category/mobile_thumbnail/ALL_All_Mobile.jpg',
      children: findBlocks('sale-text')
        ? findBlocks('sale-text')
            .map((block: BlockType) => ({
              key: block._uid,
              name: block.title,
              url: block.link,
              thumbnail: block.image_url,
              children: [],
            }))
            .concat(allSaleCategory)
        : [allSaleCategory],
    };
    const newInCategory = {
      key: 'custom_new',
      name: 'New In',
      disable: filteredOuterMenuData?.find((item) => item.slug === 'new')?.disable,
      url: '/new',
      children: findBlocks('new-category')
        ? findBlocks('new-category').map((block: BlockType) => ({
            key: block._uid,
            name: block.title,
            url: block.link,
            thumbnail: block.image_url,
            children: [],
          }))
        : [],
    };
    const designToolsCategory = {
      key: 'design_tools',
      name: 'Design Tools',
      children: findBlocks('design-category')
        ? findBlocks('design-category').map((block: BlockType) => ({
            key: block._uid,
            name: block.title,
            url: block.link,
            thumbnail: block.image_url,
            children: [],
          }))
        : [],
    };
    return (originalMenu?.children || []).concat(designToolsCategory).concat(saleCategory).concat(newInCategory);
  }, [originalMenu, findBlocks, saleName, filteredOuterMenuData]);

  const handleLinkClick = (link: string, name: string) => {
    const prefix = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`;
    dispatch(
      EVENT_GENERAL_LINK_CLICK({
        category: 'link_click',
        label: 'user_menu',
        link: name,
        dimension5: `${prefix}${link}`,
      })
    );
    setTimeout(() => {
      window.location.href = `${prefix}${link}`;
    }, 300);
  };

  const isBusinessHours = () => {
    const nowDate = moment();
    const fmt = 'hh:mm A';
    const isWeekdays = nowDate.day() < 6;
    const businessHour = GLADLY_BUSINESS_HOURS[EcEnv.NEXT_PUBLIC_COUNTRY][isWeekdays ? 'Weekdays' : 'Weekends'];
    if (businessHour) {
      const start = moment(businessHour.from, fmt);
      const end = moment(businessHour.to, fmt);
      return nowDate.isBetween(start, end);
    }
    return false;
  };

  const handleChatFallback = () => {
    if (EcEnv.NEXT_PUBLIC_COUNTRY === 'SG') {
      window.location.href = 'https://wa.me/6582410030';
    }
  };

  const handleCartIconClick = () => {
    dispatch(cartIconClickedEvent());
    handleLinkClick('/cart', 'Cart');
  };

  const chatConfig = getChatConfig(EcEnv.NEXT_PUBLIC_COUNTRY, isCasaEnabled, isBusinessHours());

  const chooseCategory = (index: number) => {
    setChosenIndex(index);
  };
  const chosenCategory = categories[chosenIndex];

  return (
    <>
      <Stack
        sx={{
          width: '100%',
          height: 56,
          backgroundColor: (theme) => theme.palette.brand.warmLinen[500],
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <IconButton
            data-selenium="header-menu"
            type="button"
            aria-haspopup="menu"
            aria-expanded={drawerOpen}
            aria-controls="menu"
            aria-label="Navigation"
            onClick={() => {
              if (!firstClicked) {
                setFirstClicked(true);
                setTimeout(() => {
                  setDrawerOpen(true);
                }, 50);
              } else {
                setDrawerOpen(true);
              }
            }}
            sx={(theme) => ({
              minWidth: `${theme.spacing(6)} !important`,
              minHeight: `${theme.spacing(6)} !important`,
              padding: '0 !important',
              maxWidth: `${theme.spacing(6)} !important`,
              maxHeight: `${theme.spacing(6)} !important`,
              marginRight: theme.spacing(3),
            })}
          >
            <MenuMore
              sx={(theme) => ({
                width: theme.spacing(6),
                height: theme.spacing(6),
              })}
            />
          </IconButton>
          <IconButton
            data-selenium="header-search"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            aria-controls="search-overlay"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            sx={(theme) => ({
              minWidth: `${theme.spacing(6)} !important`,
              minHeight: `${theme.spacing(6)} !important`,
              padding: '0 !important',
              maxWidth: `${theme.spacing(6)} !important`,
              maxHeight: `${theme.spacing(6)} !important`,
            })}
          >
            <Search
              sx={(theme) => ({
                width: theme.spacing(6),
                height: theme.spacing(6),
                fill: theme.palette.brand.mono[900],
              })}
            />
          </IconButton>
        </Box>
        <WebLOGO usedInMobile={true} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <UserMenu />
          <Stack
            sx={(theme) => ({
              marginLeft: tablet ? theme.spacing(3) : 0,
              marginTop: tablet && activeUser ? theme.spacing(0.5) : 0,
            })}
          >
            <ShoppingBagButton onClick={handleCartIconClick} />
          </Stack>
        </Box>
      </Stack>
      {firstClicked && (
        <Drawer
          id="menu"
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{
            content: {
              'aria-label': 'Navigation menu',
              'aria-labelledby': 'menu-title',
              'aria-describedby': 'menu-description',
            },
          }}
          sx={{
            '.MuiDrawer-backdrop': {
              opacity: '.5',
              backgroundColor: '#000',
            },
            '.MuiDrawer-content': {
              position: 'relative',
              width: '100%',
              height: '100%',
              maxWidth: '600px',
            },
            [`.${modalCloseClasses.root}`]: {
              display: 'none',
            },
          }}
        >
          <Stack
            id="menu-title"
            aria-label="Navigation menu header"
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: 56,
              boxShadow: '0px 0px 20px -4px rgba(34, 34, 34, 0.08)',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 24px',
              backgroundColor: (theme) => theme.palette.brand.warmLinen[500],
            }}
          >
            <Box>
              <CountrySelector mode="simple" size="sm" />
            </Box>
            <WebLOGO usedInMobile={true} />
            <IconButton
              aria-label="Close menu"
              title="Close menu"
              sx={(theme) => ({
                minWidth: `${theme.spacing(6)} !important`,
                minHeight: `${theme.spacing(6)} !important`,
                padding: '0 !important',
                maxWidth: `${theme.spacing(6)} !important`,
                maxHeight: `${theme.spacing(6)} !important`,
              })}
              onClick={() => setDrawerOpen(false)}
            >
              <Close
                sx={(theme) => ({
                  width: theme.spacing(6),
                  height: theme.spacing(6),
                  fill: theme.palette.brand.mono[900],
                })}
              />
            </IconButton>
          </Stack>
          <Stack
            id="menu-description"
            aria-label="Navigation menu content"
            sx={(theme) => ({
              position: 'absolute',
              left: 0,
              top: 56,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: theme.palette.brand.warmLinen[200],
            })}
          >
            <Stack
              sx={{
                flex: '0 0 auto',
                width: { xs: '118px', sm: '150px' },
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                '-webkit-overflow-scrolling': 'touch',
                borderRight: (theme) => `1px solid ${theme.palette.brand.mono[300]}`,
              }}
            >
              <List
                sx={{
                  flexGrow: 0,
                }}
              >
                {categories.map(
                  (category, index) =>
                    category.name &&
                    !category.disable && (
                      <ListItem
                        key={index}
                        sx={{
                          position: 'relative',
                          padding: 0,
                          paddingRight: '16px',
                          paddingLeft: '24px',
                          '&::after': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            right: '-10px',
                            top: '50%',
                            transform: 'translate(0, -50%)',
                            width: 3,
                            height: 35,
                            backgroundColor: (theme) =>
                              index === chosenIndex ? theme.palette.brand.terracotta[500] : 'transparent',
                          },
                        }}
                      >
                        <Link
                          onClick={() => chooseCategory(index)}
                          sx={{
                            padding: '15px 0',
                            outline: 'none',
                            lineHeight: '1.2',
                            fontSize: '16px !important',
                            textDecoration: 'none',
                            color: (theme) =>
                              category.key === 'custom_sale' || chosenIndex === index
                                ? theme.palette.brand.burntOrange[600]
                                : theme.palette.brand.maroonVelvet[500],
                          }}
                        >
                          {category.name === 'Design Tools' ? 'Inspiration & Tools' : category.name}
                        </Link>
                        <Stack
                          sx={() => ({
                            position: 'absolute',
                            right: '-2px',
                            height: '27px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '2px',
                            backgroundColor:
                              index === chosenIndex ? theme.palette.brand.burntOrange[600] : 'transparent',
                          })}
                        />
                      </ListItem>
                    )
                )}
                {findBlocks('new-category')?.length === 0 && !findItem('new')?.disable && (
                  <ListItem>
                    <Link
                      sx={{
                        padding: '15px 0',
                        outline: 'none',
                        lineHeight: '1.2',
                        fontSize: '1rem',
                        color: (theme) => theme.palette.brand.charcoal[800],
                      }}
                      href={'/new'}
                    >
                      New In
                    </Link>
                  </ListItem>
                )}
              </List>
              <List
                sx={{
                  paddingTop: '24px',
                  flexGrow: 0,
                  borderTop: (theme) => `1px solid ${theme.palette.brand.mono[300]}`,
                  gap: '24px',
                }}
              >
                {globalNavFiltered.map((item, index) => {
                  return (
                    <ListItem
                      key={index}
                      sx={{
                        padding: 0,
                        a: {
                          paddingLeft: '24px',
                          paddingRight: '16px',
                          outline: 'none',
                          lineHeight: '1.2',
                          fontSize: '16px',
                          color: (theme) => theme.palette.brand.charcoal[800],
                          textDecoration: 'none !important',
                          fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                        },
                      }}
                    >
                      <CustomLink linkKey={item.link.url} prefetch={false}>
                        {item.name}
                      </CustomLink>
                    </ListItem>
                  );
                })}
              </List>
              <List
                sx={{
                  flexGrow: 0,
                  borderTop: (theme) => `1px solid ${theme.palette.brand.mono[300]}`,
                  paddingTop: '24px',
                  gap: '24px',
                }}
              >
                <ListItem
                  sx={{
                    padding: 0,
                    a: {
                      paddingLeft: '24px',
                      paddingRight: '16px',
                      outline: 'none',
                      lineHeight: '1.2',
                      fontSize: '16px',
                      fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                      color: (theme) => theme.palette.brand.charcoal[800],
                      textDecoration: 'none',
                    },
                  }}
                >
                  <CustomLink
                    linkKey={basePageConfig.wishlist}
                    prefetch={false}
                    //  isExternalFlag={true}
                  >
                    Wishlist
                  </CustomLink>
                </ListItem>
                <ListItem
                  sx={{
                    padding: 0,
                    a: {
                      paddingLeft: '24px',
                      paddingRight: '16px',
                      outline: 'none',
                      lineHeight: '1.2',
                      fontSize: '16px',
                      fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                      color: (theme) => theme.palette.brand.charcoal[800],
                      textDecoration: 'none !important',
                    },
                  }}
                >
                  <CustomLink
                    linkKey={basePageConfig.profile}
                    prefetch={false}
                    // isExternalFlag={true}
                  >
                    My Account
                  </CustomLink>
                </ListItem>
                <ListItem
                  sx={{
                    padding: 0,
                    a: {
                      paddingLeft: '24px',
                      paddingRight: '16px',
                      outline: 'none',
                      lineHeight: '1.2',
                      fontSize: '16px',
                      fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                      color: (theme) => theme.palette.brand.charcoal[800],
                      textDecoration: 'none !important',
                    },
                  }}
                  onClick={async () => {
                    await openMenuCustomerServiceChat({
                      closeDrawer: () => setDrawerOpen(false),
                      fallback: handleChatFallback,
                      getCustomerServiceApi,
                    });
                  }}
                >
                  <Link
                    sx={{
                      padding: '15px 0',
                      outline: 'none',
                      lineHeight: '1.2',
                      fontSize: '12.8px',
                      color: (theme) => theme.palette.brand.charcoal[800],
                    }}
                  >
                    {chatConfig.label}
                  </Link>
                </ListItem>
              </List>
            </Stack>
            <Stack
              sx={{
                flex: '1 1 auto',
                height: '100%',
                overflow: 'auto',
              }}
            >
              {chosenCategory && (
                <Stack
                  sx={{
                    flex: '1 1 auto',
                    height: '100%',
                    overflow: 'auto',
                    a: {
                      borderBottom: (theme) => `1px solid ${theme.palette.brand.mono[300]}`,
                      padding: '16px 24px',
                      color: (theme) => theme.palette.brand.charcoal[800],
                      textDecoration: 'none',
                    },
                  }}
                >
                  {chosenIndex + 1 <= (originalMenu?.children?.length || 0) &&
                    originalMenu?.children?.[chosenIndex] && (
                      <CustomLink
                        linkKey={originalMenu.children[chosenIndex].url}
                        onClick={() => setDrawerOpen(false)}
                        prefetch={false}
                      >
                        <Stack
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                          }}
                        >
                          <Typography level="caption1" sx={{ fontSize: '16px !important' }}>
                            {`All ${chosenCategory.name}`}
                          </Typography>
                          <FortressImage
                            imageWidth={100}
                            imageHeight={64}
                            objectFit="contain"
                            src={removeBgColor(chosenCategory.image)}
                            alt={`All ${chosenCategory.name}`}
                            sx={{
                              marginLeft: '15px',
                            }}
                            sizes={'100px'}
                          />
                        </Stack>
                      </CustomLink>
                    )}
                  {chosenCategory.children.map((category, index) => {
                    const { name } = category;
                    let { url } = category;
                    if (url?.indexOf('/') === 0) {
                      url = url?.replace('/', '');
                    }
                    return (
                      <CustomLink
                        linkKey={url}
                        prefetch={false}
                        // sx={{
                        //   borderBottom: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
                        //   padding: '10px 20px',
                        //   color: (theme) => theme.palette.brand.charcoal[800],
                        // }}
                        key={index}
                        // isExternalFlag={true}
                        onClick={() => setDrawerOpen(false)}
                      >
                        <Stack
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                          }}
                        >
                          <Typography
                            level="caption1"
                            sx={{
                              lineHeight: '20px',
                              fontSize: '16px !important',
                            }}
                          >
                            {name}
                          </Typography>
                          <FortressImage
                            imageWidth={100}
                            imageHeight={64}
                            objectFit="contain"
                            src={removeBgColor(category.thumbnail || category.image)}
                            alt={name}
                            sx={{
                              marginLeft: '15px',
                              maxWidth: '100px',
                              minWidth: '100px',
                              maxHeight: '64px',
                              minHeight: '64px',
                            }}
                            sizes={'100px'}
                          />
                        </Stack>
                      </CustomLink>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </Stack>
        </Drawer>
      )}
      <Container
        disableGutters
        sx={{
          display: searchOpen ? 'block' : 'none',
          position: 'fixed',
          zIndex: 1900,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: 0,
          backgroundColor: 'rgba(0, 0, 0, .5)',
        }}
        onClick={() => setSearchOpen(false)}
      >
        <Stack
          sx={{
            width: '100%',
            height: '50px',
            backgroundColor: (theme) => theme.palette.brand.warmLinen[500],
            justifyContent: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <SearchInput
            isHidden={!searchOpen}
            handleClose={() => setSearchOpen(false)}
            onClose={() => setSearchOpen(false)}
          />
        </Stack>
      </Container>
    </>
  );
};

export default MobileMenu;
