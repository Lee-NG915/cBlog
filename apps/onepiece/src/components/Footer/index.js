import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getPageByKey, getUrl } from 'pages';
import lang from 'utils/lang';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';

import { CountrySelector } from 'components/CountrySelector';
import ReactImage from 'components/ReactPicture';
import { getDate } from 'utils/time';

import {
  Stack,
  Typography,
  linkClasses,
  typographyClasses,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  ListDivider,
  listDividerClasses,
  listClasses,
  listItemButtonClasses,
  listItemClasses,
  listSubheaderClasses,
  Divider,
  selectClasses,
  sheetClasses,
  Box,
  Container,
} from '@castlery/fortress';

import { Accordion, AccordionHeader, AccordionContent } from 'fortress';
import { accordionHeaderClasses } from 'fortress/Accordion/Accordion';

import { showLoyalTyV2Requirements } from 'utils/loyaltyV2';
import {
  enableAccessibilityTool,
  enableCKYTool,
  cookieConsentLabel,
  globalFeatureInAU,
  globalFeatureInSG,
} from 'config';
import { getExternalUrl } from 'utils/brandRefeshLinkJump';
import { ABOUT_LINKS, FOOTER_LINKS, SHOP_LINKS, FOOTER_LINKS_DESKTOP } from './config';
import Social from './Social';
import FooterSubscription from './FooterSubscription';
import Acknowledgement from './Acknowledgement';

// Footer 专用的 QuickLink 组件，强制使用外部链接
const FooterQuickLink = ({ pageKey, name, simple, sx = [], href, children, ...rest }) => {
  if (href) {
    const externalUrl = getExternalUrl(href);
    // const useInternalRoute = shouldUseInternalRoute(href);
    // if (useInternalRoute) {
    //   return (
    //     <RouterLink to={href} {...rest}>
    //       {name}
    //     </RouterLink>
    //   );
    // }
    const link = (
      <a href={externalUrl} {...rest}>
        {name}
      </a>
    );

    return simple ? (
      link
    ) : (
      <ListItem level="caption1" sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}>
        {link}
      </ListItem>
    );
  }

  const page = getPageByKey(pageKey);
  if (page) {
    const externalUrl = getExternalUrl(page.url);
    const link = (
      <a href={externalUrl} {...rest}>
        {name || page.name}
      </a>
    );
    return simple ? (
      link
    ) : (
      <ListItem level="caption1" sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}>
        {link}
      </ListItem>
    );
  }

  return (
    <Typography level="caption1" sx={{ mt: '12px' }} {...rest}>
      {name}
    </Typography>
  );
};

FooterQuickLink.propTypes = {
  pageKey: PropTypes.string,
  name: PropTypes.string,
  simple: PropTypes.bool,
  sx: PropTypes.array,
  href: PropTypes.string,
  children: PropTypes.any,
};

FooterQuickLink.defaultProps = {
  simple: false,
};

const SafeLi = ({ pageKey, sx = [], name }) => {
  const page = getPageByKey(pageKey);
  if (page) {
    const externalUrl = getExternalUrl(page.url);
    return (
      <ListItem sx={[...(Array.isArray(sx) ? sx : [sx])]}>
        {/* 使用 a 标签进行外部链接跳转 */}
        <Typography level="caption1" component="a" href={externalUrl}>
          {name || page.name}
        </Typography>
      </ListItem>
    );
  }
  return null;
};
SafeLi.propTypes = {
  pageKey: PropTypes.string,
  sx: PropTypes.array,
  name: PropTypes.string,
};

export const footerPalette = {
  color: `#F6F3E7`,
  bg: `#844025`,
  hoverBg: `#844025`,
  activeBg: '',
  disableColor: '',
  disableBg: '',
};

// TODO The display of information on mobile and desktop should be consolidated.
// const footerContent = {
//   ShoppingWithUs: {
//     name: `Shopping With Us`,
//     items: [{ link: { to: '/link', href: '' }, onClick: null }],
//   },
// };
const FooterDesktopContent = ({ handleAccessibilityTool }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    sx={() => ({
      flexGrow: 1,
      '--fortress-palette-neutral-plainHoverColor': '#F6F3E7',
      [`& .${listSubheaderClasses.root}`]: {
        textTransform: 'none',
      },
      [`& .${listClasses.root}`]: {
        '--ListItem-paddingX': 0,
        '--ListItem-paddingY': 4,
      },

      '& .MuiListItem-root a': {
        color: '#f6f3e7 !important',
      },
    })}
  >
    {/* ----------------------------------What's Popular----------------------------------------  */}
    <List sx={{ flex: 1 }}>
      <ListSubheader sx={{ textTransform: 'none !important' }}>What's popular</ListSubheader>
      {FOOTER_LINKS_DESKTOP?.map((c) => (
        <SafeLi key={c.pageKey} name={c.anchorText} pageKey={c.pageKey} />
      ))}
    </List>
    {/* ----------------------------------About Us----------------------------------------  */}
    <List sx={{ flex: 1 }}>
      <ListSubheader sx={{ textTransform: 'none !important' }}>About Us</ListSubheader>
      {ABOUT_LINKS?.map((item, i) => item && <FooterQuickLink key={i} {...item} />)}
    </List>
    {/* ----------------------------------Shopping With Us----------------------------------------  */}
    <List sx={{ flex: 1 }}>
      <ListSubheader sx={{ textTransform: 'none !important' }}>Shopping With Us</ListSubheader>
      {globalFeatureInSG && (
        <ListItem>
          <a href={getExternalUrl(getUrl('new-homeowners'))} style={{ color: '#f6f3e7' }}>
            New Homeowners Special
          </a>
        </ListItem>
      )}
      {globalFeatureInSG && (
        <ListItem>
          <a href={getExternalUrl(getUrl('interior-styling-service'))}>Interior Styling Service</a>
        </ListItem>
      )}
      {__YOTPO_ENABLED__ && (
        <>
          <ListItem>
            <a href={getExternalUrl(getUrl('rewards'))}>{lang.t('common.loyalty')}</a>
          </ListItem>
          {showLoyalTyV2Requirements && (
            <ListItem>
              <a href={getExternalUrl(getUrl('referral'))}>{lang.t('pages.referral.name')}</a>
            </ListItem>
          )}
        </>
      )}

      {SHOP_LINKS?.map(({ pageKey }, i) => (
        <FooterQuickLink key={i} pageKey={pageKey} />
      ))}
      <ListItem>
        <a href={getExternalUrl('/web-ar')}>Try Web AR</a>
      </ListItem>
      {enableAccessibilityTool && (
        <ListItem>
          <ListItemButton onClick={handleAccessibilityTool}>Accessibility Tool</ListItemButton>
        </ListItem>
      )}
      {globalFeatureInAU && (
        <ListItem>
          <a href={getExternalUrl('/zip')}>Using Zip Pay</a>
        </ListItem>
      )}
      {/* </ListItem> */}
    </List>
    {/* ---------------------------------- subscription ----------------------------------------  */}
    <Stack spacing="28px" sx={{ flex: 2 }}>
      <FooterSubscription footerPalette={footerPalette} />
      <Social title="Social" />
      <ReactImage
        src="https://res.cloudinary.com/castlery/image/upload/v1760341082/CASTLERY_BRANDMARK_RGB_COL_WARMLINEN_DESKTOP_wdnnuf.png"
        alt="castlery brand mark"
        style={{
          width: '421px',
          height: '106px',
          objectFit: 'contain',
        }}
      />
    </Stack>
  </Stack>
);
FooterDesktopContent.propTypes = {
  handleAccessibilityTool: PropTypes.func,
};

const FooterMobileContent = ({ handleAccessibilityTool }) => (
  <>
    <FooterSubscription footerPalette={footerPalette} />
    <List
      component={Accordion.Root}
      className={Accordion.Root}
      indicator
      type="multiple"
      // defaultValue={['item-1']}
      variant="plain"
      color="primary"
      sx={(theme) => ({
        borderRadius: 'none',
        '--ListDivider-gap': '0px',
        '--focus-outline-offset': '-2px',
        '--ListItem-paddingY': '0',
        '--ListItem-paddingX': '0',
        '--ListItem-paddingRight': '0',
        '--ListItem-paddingLeft': '0',
        '.fortress-AccordionHeader-header': {
          // margin: '8px 0',
          border: 'none',
          button: {
            border: 'none',
          },
          py: '12px',
        },
        [`& .${sheetClasses.root}`]: {
          bgcolor: 'transparent',
          p: '0',
        },
        [`& .${listDividerClasses.root}`]: {
          '--Divider-lineColor': `${footerPalette.color}`,
        },

        [`& .${accordionHeaderClasses.header}`]: {
          paddingInlineStart: '0',
          [`& .${sheetClasses.root}`]: {
            padding: '8px 0',
          },
          [`& .${accordionHeaderClasses.icon}`]: {
            '&:before, &:after': {
              bgcolor: '#F6F3E7',
            },
          },
          ':hover': {
            [`& .${accordionHeaderClasses.icon}`]: {
              '&:before, &:after': {
                bgcolor: '#F6F3E7',
              },
            },
          },
        },
        '& .MuiListItem-root a': {
          color: '#F6F3E7 !important',
        },
        '.MuiListItem-root + .MuiListItem-root': {
          mt: '12px',
        },
      })}
    >
      <Accordion.Item value="Furniture">
        <AccordionHeader>
          {/* How do I know if I need to buy a license? */}
          <Typography level="h5">What's popular</Typography>
        </AccordionHeader>
        <AccordionContent>
          <ul style={{ columns: 2, paddingInlineStart: 0 }}>
            {Array.isArray(FOOTER_LINKS) &&
              FOOTER_LINKS?.map((category) => (
                <SafeLi key={category?.pageKey} name={category.anchorText} pageKey={category.pageKey} />
              ))}
          </ul>
        </AccordionContent>
      </Accordion.Item>

      <ListDivider component="div" />

      <Accordion.Item value="About Us">
        <AccordionHeader iconColor={footerPalette.color}>
          <Typography level="h5">About Us</Typography>
        </AccordionHeader>
        <AccordionContent>
          <ul style={{ columns: 2, paddingInlineStart: 0, fontSize: '12px' }}>
            {ABOUT_LINKS?.map((item, i) => (
              <FooterQuickLink key={i} {...item} sx={{ whiteSpace: 'nowrap' }} />
            ))}
          </ul>
        </AccordionContent>
      </Accordion.Item>

      <ListDivider component="div" />

      <Accordion.Item value="Shopping With Us">
        <AccordionHeader isLast iconColor={footerPalette.color}>
          <Typography level="h5">Shopping With Us</Typography>
        </AccordionHeader>
        <AccordionContent isLast>
          <ul style={{ columns: 2, paddingInlineStart: 0, fontSize: '12px' }}>
            {globalFeatureInSG && (
              <ListItem>
                <a href={getExternalUrl(getUrl('new-homeowners'))}>New Homeowners Special</a>
              </ListItem>
            )}
            {globalFeatureInSG && (
              <ListItem>
                <a href={getExternalUrl(getUrl('interior-styling-service'))}>Interior Styling Service</a>
              </ListItem>
            )}
            {__YOTPO_ENABLED__ && (
              <>
                <ListItem>
                  <a href={getExternalUrl(getUrl('rewards'))}>{lang.t('common.loyalty')}</a>
                </ListItem>
                {showLoyalTyV2Requirements && (
                  <ListItem>
                    <a href={getExternalUrl(getUrl('referral'))}>{lang.t('pages.referral.name')}</a>
                  </ListItem>
                )}
              </>
            )}
            {SHOP_LINKS?.map((item, i) => (
              <FooterQuickLink key={i} {...item} />
            ))}
            <ListItem>
              <a href={getExternalUrl('/web-ar')}>Try Web AR</a>
            </ListItem>
            {enableAccessibilityTool && (
              <ListItem>
                <ListItemButton onClick={handleAccessibilityTool}>Accessibility Tool</ListItemButton>
              </ListItem>
            )}
            {globalFeatureInAU && (
              <ListItem>
                <a href={getExternalUrl('/zip')}>Using Zip Pay</a>
              </ListItem>
            )}
          </ul>
        </AccordionContent>
        <ListDivider component="div" />
      </Accordion.Item>
    </List>

    <Social />
    <CountrySelector
      showIcon={false}
      size="md"
      sx={(theme) => ({
        maxWidth: 'fit-content',
        color: footerPalette.color,
        '--fortress-palette-neutral-plainHoverColor': theme.palette.neutral[300],
        fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: 0,
        '@media (min-width: 0px) and (max-width: 600px)': {
          fontSize: '0.75rem',
        },
        '@media (min-width: 601px) and (max-width: 900px)': {
          fontSize: '0.75rem',
        },
        '@media (min-width: 901px)': {
          fontSize: '0.875rem',
        },
        '--Select-paddingInline': 0,
        [`& .${selectClasses.button}`]: {
          justifyContent: 'flex-start',
          color: footerPalette.color,
        },
      })}
    />
    <ReactImage
      src="https://res.cloudinary.com/castlery/image/upload/v1760341082/CASTLERY_BRANDMARK_RGB_COL_WARMLINEN_DESKTOP_wdnnuf.png"
      alt="castlery brand mark"
      style={{
        width: '342px',
        height: '87px',
        objectFit: 'contain',
      }}
    />
  </>
);
FooterMobileContent.propTypes = {
  handleAccessibilityTool: PropTypes.func,
};
const Footer = ({ forwardRef, isCastleryApp }) => {
  const isAccessibilityToolLoaded = useRef(false);
  const { desktop: isDesktop } = useBreakpoints();
  const handleAccessibilityTool = useCallback(() => {
    if (!isAccessibilityToolLoaded.current) {
      const s = document.createElement('script');
      /* uncomment the following line to override default position */
      /* s.setAttribute("data-position", 1); */
      /* uncomment the following line to override default size (values: small, large) */
      /* s.setAttribute("data-size", "large"); */
      /* uncomment the following line to override default language (e.g., fr, de, es, he, nl, etc.) */
      /* s.setAttribute("data-language", "null"); */
      /* uncomment the following line to override color set via widget (e.g., #053f67) */
      /* s.setAttribute("data-color", "#2d68ff"); */
      /* uncomment the following line to override type set via widget (1=person, 2=chair, 3=eye, 4=text) */
      /* s.setAttribute("data-type", "1"); */
      s.setAttribute('data-statement_text', 'Our Accessibility Statement');
      s.setAttribute('data-statement_url', 'https://www.castlery.com/us/accessibility');
      /* uncomment the following line to override support on mobile devices */
      /* s.setAttribute("data-mobile", true); */
      /* uncomment the following line to set custom trigger action for accessibility menu */
      /* s.setAttribute("data-trigger", "triggerId") */
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
  if (isCastleryApp) {
    return null;
  }

  return (
    <>
      <Box
        sx={(theme) => ({
          backgroundColor: theme.palette.brand.flour[50],
          '--fortress-fontFamily-body': 'Aime',
        })}
      >
        {lang.t('common.acknowledgement') !== 'null' && <Acknowledgement text={lang.t('common.acknowledgement')} />}
      </Box>
      <Box component="footer" role="contentinfo" ref={forwardRef} sx={{ bgcolor: footerPalette.bg }}>
        <Container
          fixed
          sx={(theme) => ({
            // py: { xs: 7, lg: 5 },
            py: '32px',
            px: '24px',
            color: footerPalette.color,
            '--fortress-fontFamily-body': 'Aime',

            [`& .${typographyClasses.root}, & .${selectClasses.root}`]: {
              color: footerPalette.color,
            },
            [`& .${listSubheaderClasses.root}`]: {
              textTransform: 'normal',
              color: footerPalette.color,
            },
            [`& .${listClasses.root}`]: {
              '--List-padding': 0,

              '--ListItem-minHeight': 0,

              [`& .${listSubheaderClasses.root}`]: {
                fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                '@media (min-width: 0px) and (max-width: 600px)': {
                  fontSize: '1rem',
                },
                '@media (min-width: 601px) and (max-width: 900px)': {
                  fontSize: '1rem',
                },
                '@media (min-width: 901px)': {
                  fontSize: '1.125rem',
                },

                '--ListItem-paddingY': 0,
                // marginBottom: 2,

                // '--fortress-letterSpacing-md': 0,
                // fontStyle: 'normal',
              },
              [`& .${listItemClasses.root}`]: {
                '& a': {
                  fontFamily: 'Aime',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  letterSpacing: 0,
                  sm: {
                    fontSize: '0.75rem', // 12px
                  },
                  md: {
                    fontSize: '0.75rem', // 12px
                  },
                  lg: {
                    fontSize: '0.875rem', // 14px
                  },
                  textTransform: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                    textDecorationColor: '#F6F3E7',
                    textUnderlineOffset: '2px',
                  },
                },
              },

              // 12px
              // '--Typography-fontSize': theme.fontSize.xs,
            },
          })}
        >
          <Stack
            sx={(theme) => ({
              // ui  style
              [`& .${listItemClasses.root}`]: {
                '--ListItem-paddingY': '0',
                md: {
                  marginTop: '12px',
                },
                [`& .${listItemButtonClasses.root}, & .${linkClasses.root}`]: {
                  // list item 的字体大小
                  ...theme.typography.caption1,
                  color: '#F6F3E7',
                  ':hover': {
                    color: '#F6F3E7',
                  },
                },
              },
            })}
            spacing={{ xs: 3, lg: 2 }}
            mb={{ xs: 2 }}
          >
            {isDesktop ? (
              <FooterDesktopContent handleAccessibilityTool={handleAccessibilityTool} />
            ) : (
              <FooterMobileContent handleAccessibilityTool={handleAccessibilityTool} />
            )}
          </Stack>

          <Divider
            sx={(theme) => ({
              my: { xs: 3, lg: '28px' },
              '--Divider-lineColor': theme.palette.brand.flour[10],
            })}
          />

          <Stack
            display="flex"
            direction={{ xs: 'column-reverse', lg: 'row-reverse' }}
            gap={{ xs: 2 }}
            spacing={3}
            sx={(theme) => ({
              [`& .${linkClasses.root}`]: {
                // ...theme.typography.caption2,
                color: footerPalette.color,
                // lineHeight: theme.lineHeight.lg,
              },
              '--ListItem-paddingY': '0',
              // '& .MuiTypography-body2': {
              //   // lineHeight: 1.4,
              //   // letterSpacing: 0,
              //   xs: {
              //     fontSize: '0.875rem', // 14px
              //   },
              //   sm: {
              //     fontSize: '0.875rem', // 14px
              //   },
              //   md: {
              //     fontSize: '1rem', // 16px
              //   },
              // },
              '& .MuiListItem-root': {
                xs: {
                  py: '8px',
                },
                md: {
                  py: '0',
                },
              },
            })}
          >
            <Typography level="body2">&copy; {getDate().year()} Castlery. All rights reserved.</Typography>

            <List
              orientation="horizontal"
              sx={(theme) => ({
                flexWrap: 'wrap',
                mb: '0',
                justifyContent: {
                  xs: 'flex-start',
                  // lg: 'flex-end',
                },
                '--ListItem-paddingLeft': 0,
                '--ListItem-paddingY': '8px',
                [`& .${listItemClasses.root}`]: {
                  paddingInlineEnd: 2,
                  paddingInlineStart: 0,
                },
                '&.MuiList-root': {
                  mb: '0',
                  marginBottom: '0',
                },
                '& .MuiListItem-root': {
                  color: '#f6f3e7 !important',
                  fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  letterSpacing: 0,
                  '@media (min-width: 0px) and (max-width: 600px)': {
                    fontSize: '0.75rem',
                  },
                  '@media (min-width: 601px) and (max-width: 900px)': {
                    fontSize: '0.75rem',
                  },
                  '@media (min-width: 901px)': {
                    fontSize: '0.875rem',
                  },
                },
                '& a': {
                  color: '#f6f3e7 !important',
                },
              })}
            >
              <FooterQuickLink pageKey="privacy-policy" name="Privacy" />
              <FooterQuickLink pageKey="terms-of-use" name="Terms" />
              <FooterQuickLink pageKey="promo-terms" name="Promo Terms*" />
              {__YOTPO_ENABLED__ && (
                <FooterQuickLink
                  pageKey="store-credits-terms"
                  name={showLoyalTyV2Requirements ? 'The Castlery Club Terms' : 'Store Credits Terms'}
                />
              )}
              <FooterQuickLink pageKey="sitemap" />
              <FooterQuickLink pageKey="accessibility" />
              {enableCKYTool && (
                <FooterQuickLink
                  href="#"
                  name={cookieConsentLabel}
                  onClick={(e) => {
                    e.preventDefault();
                    window.revisitCkyConsent && window.revisitCkyConsent();
                  }}
                />
              )}
            </List>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Footer.propTypes = {
  forwardRef: PropTypes.func,
  isCastleryApp: PropTypes.bool,
};

export default connect((state) => ({
  user: state.auth.user,
  isCastleryApp: state.browser.isCastleryApp,
  shouldShowSubscription: state.subscriptionBar.showOnHomePage,
}))(Footer);
