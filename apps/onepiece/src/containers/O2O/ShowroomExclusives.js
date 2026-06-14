import React from 'react';
import Helmet from 'components/Helmet';
import Footer from 'components/Footer';
import Header from 'components/Header';
import { Link as RouterLink } from 'react-router';
import {
  Button,
  Box,
  Card,
  CardOverflow,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme,
  Sheet,
  Container,
} from '@castlery/fortress';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  selectO2OBanner,
  selectO2OCards,
  selectO2OFooter,
  selectO2OIcons,
  selectO2OSeo,
} from 'redux/modules/showroomExclusives';
import ReactPicture from 'components/ReactPicture';
import { ArrowRight } from '@castlery/fortress/Icons';
import { EVENT_SHOWROOM_EXCLUSIVES } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';

/**
 *
 * @param {String} url
 */
const genURLProps = (url) => {
  let res = {};
  try {
    if (url.startsWith('/')) {
      res = {
        to: url,
      };
    } else {
      res = {
        href: url,
      };
    }
  } catch (e) {
    console.log(`==============>e`);
    console.log(e);
  }
  return res;
};

export const O2OImg = ({ imgOfDesktop = {}, imgOfMobile = {}, link = {}, lazy = true, ratio, position }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { mobile } = useBreakpoints();

  const img = mobile ? imgOfMobile : imgOfDesktop;

  const content = (
    <>
      <ReactPicture
        bgColor={theme.palette.primary[300]}
        srcset={img.filename}
        alt={img.alt}
        loader={{
          objectFit: 'cover',
          ratio,
        }}
        lazy={lazy}
      />
      <Typography level="h1" display="none">
        {img.title}
      </Typography>
    </>
  );
  return (
    <>
      {link?.url ? (
        <RouterLink
          // {...link}
          {...genURLProps(link.url)}
          target={link?.target}
          onClick={() =>
            dispatch({
              type: EVENT_SHOWROOM_EXCLUSIVES,
              result: {
                label: img.title,
                position,
              },
            })
          }
        >
          {content}
        </RouterLink>
      ) : (
        content
      )}
    </>
  );
};
O2OImg.propTypes = {
  imgOfDesktop: PropTypes.object,
  imgOfMobile: PropTypes.object,
  link: PropTypes.object,
  lazy: PropTypes.bool,
  ratio: PropTypes.number,
  position: PropTypes.oneOf(['Banner', 'Footer']),
};
export const O2OIcon = ({ icons = [], title } = {}) => (
  <Box
    sx={(theme) => ({
      bgcolor: theme.palette.brand.chai[200],
      py: { xs: theme.spacing(7), md: theme.spacing(8), lg: theme.spacing(16) },
      px: { xs: theme.spacing(4), md: theme.spacing(16), lg: theme.spacing(32) },
    })}
  >
    <Grid container justifyContent="center" alignItems="center">
      <Grid
        xs={10}
        md={10}
        sx={(theme) => ({
          mb: theme.spacing(6),
        })}
      >
        <Typography textAlign="center" level="h2">
          {title}
        </Typography>
      </Grid>
      <Grid xs={6} md={12} container direction="row" justifyContent="space-between" gap={{ xs: 6 }}>
        {icons.map((item, index) => (
          <Grid
            container
            xs={12}
            sm={10}
            md={3}
            key={index}
            spacing={{ xs: 2, md: 3 }}
            justifyContent="flex-start"
            alignItems="center"
            direction="column"
          >
            <Grid
              xs={7}
              lg={6}
              sx={(theme) => ({
                [theme.breakpoints.up('sm')]: {
                  height: '159px',
                  width: '159px',
                },
              })}
            >
              <ReactPicture
                srcset={item.img.filename}
                alt={item.img.alt}
                loader={{
                  objectFit: 'contain',
                }}
                lazy={false}
              />
            </Grid>
            <Grid xs={12}>
              <Typography level="body2" color="primary" textAlign="center">
                {item.desc}
              </Typography>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Grid>
  </Box>
);
O2OIcon.propTypes = {
  icons: PropTypes.array,
  title: PropTypes.string,
};
export const O2OCard = ({
  imgOfDesktop = {},
  imgOfMobile = {},
  // link = {},
  buttonLink = {},
  buttonText = 'Shop Now',
  title,
  desc,
  date,
  method,
  lazy = true,
}) => {
  const { mobile } = useBreakpoints();
  const img = mobile ? imgOfMobile : imgOfDesktop;
  const dispatch = useDispatch();

  return (
    <Sheet
      sx={(theme) => ({
        [theme.breakpoints.up('md')]: {
          height: '100%',
        },
      })}
    >
      <Card
        variant="plain"
        sx={(theme) => ({
          '--Card-padding': '0',
          [theme.breakpoints.up('md')]: {
            // '&:hover': { boxShadow: 'lg' },
            height: '100%',
          },
          [theme.breakpoints.only('xs')]: {
            border: '',
            '--fortress-shadowRing': '',
            boxShadow: 'none',
          },
        })}
      >
        <CardOverflow>
          <ReactPicture
            srcset={img.filename}
            alt={img.alt}
            loader={{
              objectFit: 'cover',
              ratio: mobile ? 306 / 390 : 299 / 486,
            }}
            lazy={lazy}
          />
        </CardOverflow>
        <Stack
          justifyContent="center"
          alignItems="center"
          sx={(theme) => ({
            py: theme.spacing(3),
            px: theme.spacing(2),
          })}
        >
          <Typography
            level="subh1"
            sx={(theme) => ({
              mb: theme.spacing(2),
              [theme.breakpoints.up('md')]: {
                height: '27px',
              },
            })}
          >
            {date}
          </Typography>
          <Typography
            level="h2"
            sx={(theme) => ({
              mb: theme.spacing(2),
              textAlign: 'center',
            })}
          >
            {title}
          </Typography>
          <Typography level="body1" textAlign="center">
            {desc}
          </Typography>
          {buttonLink?.url && (
            <RouterLink {...genURLProps(buttonLink.url)} target={buttonLink.target}>
              <Button
                sx={(theme) => ({
                  mt: theme.spacing(3),
                  minWidth: '176px',
                })}
                // fullWidth
                variant="outlined"
                color="neutral"
                endDecorator={<ArrowRight />}
                onClick={() => {
                  dispatch({
                    type: EVENT_SHOWROOM_EXCLUSIVES,
                    result: {
                      label: title,
                      position: 'CTA',
                      method,
                    },
                  });
                }}
              >
                {buttonText}
              </Button>
            </RouterLink>
          )}
        </Stack>
      </Card>
    </Sheet>
  );
};
O2OCard.propTypes = {
  imgOfDesktop: PropTypes.object,
  imgOfMobile: PropTypes.object,
  buttonLink: PropTypes.object,
  // link: PropTypes.object,
  lazy: PropTypes.bool,
  buttonText: PropTypes.string,
  title: PropTypes.string,
  desc: PropTypes.string,
  date: PropTypes.string,
  method: PropTypes.string,
};
export const O2OCardSection = (props) => {
  const { intro, title, card = [], lazy } = props;
  return (
    <Grid direction="column" justifyContent="center" alignItems="center" container>
      <Sheet
        sx={(theme) => ({
          pt: { xs: theme.spacing(9), md: theme.spacing(12) },
          pb: theme.spacing(8),
          px: theme.spacing(3),
          bgcolor: 'transparent',
        })}
      >
        <Typography
          level="h1"
          textAlign="center"
          sx={(theme) => ({
            mb: { xs: theme.spacing(2) },
          })}
        >
          {title}
        </Typography>
        <Typography level="body1" textAlign="center">
          {intro}
        </Typography>
      </Sheet>
      <Grid md={10} lg={7} container alignContent="center" justifyContent="center" spacing={{ xs: 0, md: 9 }}>
        {card.map((item, index) => (
          <Grid xs={12} md={6} key={index}>
            <O2OCard {...item} lazy={lazy} method={title} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};
O2OCardSection.propTypes = {
  intro: PropTypes.string,
  card: PropTypes.array,
  lazy: PropTypes.bool,
  title: PropTypes.string,
};
export const ShowroomExclusives = () => {
  const banner = useSelector(selectO2OBanner);
  const footer = useSelector(selectO2OFooter);
  const icons = useSelector(selectO2OIcons);
  const cards = useSelector(selectO2OCards);
  const { mobile } = useBreakpoints();

  return (
    <Container disableGutters>
      {/* banner */}
      <O2OImg {...banner} lazy={false} ratio={mobile ? 712 / 390 : 913 / 1729} position="Banner" />
      <O2OIcon {...icons} />
      <Stack
        sx={(theme) => ({
          bgcolor: theme.palette.brand.flour[10],
          pb: { md: theme.spacing(9) },
          [theme.breakpoints.only('xs')]: {
            bgcolor: theme.palette.common.white,
          },
        })}
      >
        <O2OCardSection {...cards[0]} lazy={false} />
        {mobile && (
          <Divider
            sx={(theme) => ({
              mx: theme.spacing(10),
            })}
          />
        )}
        <O2OCardSection {...cards[1]} />
      </Stack>
      {/* footer */}
      <O2OImg {...footer} lazy={false} position="Footer" />
    </Container>
  );
};
const ShowroomExclusivesWrapper = (props) => {
  const { location = {} } = props;
  const seo = useSelector(selectO2OSeo);
  const { seoDescription = '', seoTitle = '', seoKeywords = '' } = seo;
  return (
    <>
      <Helmet
        path={location.pathname}
        page={{
          metaKeywords: seoKeywords,
          metaTitle: seoTitle,
          metaDescription: seoDescription,
        }}
      />
      <Header />
      <ShowroomExclusives />
      <Footer />
    </>
  );
};
ShowroomExclusivesWrapper.propTypes = {
  location: PropTypes.object.isRequired,
};
export default ShowroomExclusivesWrapper;
