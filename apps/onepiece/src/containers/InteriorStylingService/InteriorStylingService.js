import React from 'react';
import Helmet from 'components/Helmet';
import Footer from 'components/Footer';
import Header from 'components/Header';
import { Link as RouterLink } from 'react-router';
import { Button, Divider, Stack, Typography, useTheme, Sheet } from '@castlery/fortress';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  selectISSBanner,
  selectISSFooter,
  selectISSIcons,
  selectISSCards,
  selectISSSeo,
  selectISSDesigners,
} from 'redux/modules/interiorStylingService';
import ReactPicture from 'components/ReactPicture';
import { ArrowRight } from '@castlery/fortress/Icons';
import { EVENT_INTERIOR_STYLING_SERVICE } from 'utils/track/constants';
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
    console.log('==============>e');
    console.log(e);
  }
  return res;
};

export const ISSImg = ({ imgOfDesktop = {}, imgOfMobile = {}, link = {}, lazy = true, ratio, position }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const img = !desktop ? imgOfMobile : imgOfDesktop;

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
              type: EVENT_INTERIOR_STYLING_SERVICE,
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
ISSImg.propTypes = {
  imgOfDesktop: PropTypes.object,
  imgOfMobile: PropTypes.object,
  link: PropTypes.object,
  lazy: PropTypes.bool,
  ratio: PropTypes.number,
  position: PropTypes.oneOf(['Banner', 'Footer', 'Designers']),
};
export const ISSIcon = ({ icons = [], title } = {}) => (
  <Stack
    sx={(theme) => ({
      bgcolor: theme.palette.brand.chai[200],
      py: { xs: theme.spacing(5), md: theme.spacing(7) },
      px: {
        xs: 0,
        md: theme.spacing(16),
        lg: theme.spacing(32),
      },
      pl: {
        xs: theme.spacing(2),
      },
    })}
    justifyContent="center"
    alignItems="center"
  >
    <Typography textAlign="center" level="h2" mb={{ xs: 5, md: 7 }}>
      {title}
    </Typography>

    <Stack
      direction="row"
      justifyContent={{ xs: 'flex-start', md: 'space-around' }}
      width={{
        xs: '100%',
        md: '1000px',
      }}
      sx={() => ({
        overflowX: 'auto',
        '::-webkit-scrollbar': {
          display: 'none',
        },
      })}
    >
      {icons.map((item, index) => (
        <Stack
          key={index}
          direction="column"
          alignItems="center"
          spacing={{
            xs: 2,
            md: 3,
          }}
          mr={{
            xs: 4,
          }}
          sx={(theme) => ({
            width: '266px',
            [theme.breakpoints.only('xs')]: {
              minWidth: '127px',
            },
          })}
        >
          {/* img */}
          <Sheet
            sx={(theme) => ({
              width: '108px',
              height: '108px',
              bgcolor: 'transparent',
              [theme.breakpoints.only('xs')]: {
                width: '68px',
                height: '68px',
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
          </Sheet>
          {/* desc */}
          <Typography level="body2" color="primary" textAlign="center">
            {item.desc}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Stack>
);
ISSIcon.propTypes = {
  icons: PropTypes.array,
  title: PropTypes.string,
};
export const ISSCard = ({
  imgOfDesktop = {},
  imgOfMobile = {},
  // link = {},
  buttonLink = {},
  buttonText = 'Shop Now',
  title,
  desc,
  method,
  lazy = true,
}) => {
  const { desktop } = useBreakpoints();
  const img = !desktop ? imgOfMobile : imgOfDesktop;
  const dispatch = useDispatch();

  return (
    <Stack
      direction="column"
      sx={{
        width: '100%',
      }}
    >
      <ReactPicture
        srcset={img.filename}
        alt={img.alt}
        loader={{
          objectFit: 'cover',
          ratio: !desktop ? 306 / 390 : 384 / 485,
        }}
        lazy={lazy}
      />
      <Stack
        justifyContent="center"
        alignItems="center"
        sx={(theme) => ({
          py: theme.spacing(6),
          px: theme.spacing(2),
        })}
      >
        <Typography
          component="h2"
          level="h2"
          textAlign="center"
          sx={(theme) => ({
            mb: theme.spacing(2),
            whiteSpace: 'pre-wrap',
          })}
        >
          {title}
        </Typography>
        <Typography level="body2" textAlign="center">
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
                  type: EVENT_INTERIOR_STYLING_SERVICE,
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
    </Stack>
  );
};
ISSCard.propTypes = {
  imgOfDesktop: PropTypes.object,
  imgOfMobile: PropTypes.object,
  buttonLink: PropTypes.object,
  // link: PropTypes.object,
  lazy: PropTypes.bool,
  buttonText: PropTypes.string,
  title: PropTypes.string,
  desc: PropTypes.string,
  // date: PropTypes.string,
  method: PropTypes.string,
};
export const ISSCardSection = (props) => {
  const { intro, title, card = [], lazy } = props;
  const { desktop } = useBreakpoints();

  return (
    <Sheet
      sx={() => ({
        px: { xs: 0, lg: 3 },
      })}
    >
      <Typography level="h2" component="h1" textAlign="center" py={{ xs: 5, lg: 7 }}>
        {`${title}`}
      </Typography>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems="stretch"
        justifyContent="space-between"
        spacing={{ xs: 0, md: 3, lg: 7 }}
        divider={!desktop ? '' : <Divider orientation="vertical" inset="context" />}
      >
        {card.map((item, index) => (
          <ISSCard key={index} {...item} lazy={lazy} method={title} />
        ))}
      </Stack>
    </Sheet>
  );
};
ISSCardSection.propTypes = {
  intro: PropTypes.string,
  card: PropTypes.array,
  lazy: PropTypes.bool,
  title: PropTypes.string,
};
export const ShowroomExclusives = () => {
  const banner = useSelector(selectISSBanner);
  const footer = useSelector(selectISSFooter);
  const icons = useSelector(selectISSIcons);
  const cards = useSelector(selectISSCards);
  const designers = useSelector(selectISSDesigners);
  const { desktop } = useBreakpoints();

  return (
    <>
      {/* banner */}
      <ISSImg {...banner} lazy={false} ratio={!desktop ? 712 / 390 : 913 / 1729} position="Banner" />
      <ISSIcon {...icons} />
      <ISSCardSection {...cards[0]} lazy={false} />
      <ISSImg {...designers} lazy={false} position="Designers" />
      {/* footer */}
      <ISSImg {...footer} lazy={false} position="Footer" />
    </>
  );
};
const ShowroomExclusivesWrapper = (props) => {
  const { location = {} } = props;
  const seo = useSelector(selectISSSeo);
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
