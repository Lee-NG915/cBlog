import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import LazyLoad from 'react-lazyload';
import { getUrl } from 'pages';
import ReactPicture from 'components/ReactPicture';
import { GhostArrowBtn } from 'components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import Spinner from 'components/Spinner';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Box, Grid, Stack, Typography } from '@castlery/fortress';

const PressSection = ({ pageName = 'home', sx }) => {
  const marketing = useSelector((state) => state.marketing);
  const { desktop } = useBreakpoints();
  const { title: pressTitle, pressItems } = useMemo(() => {
    // eslint-disable-next-line prefer-const
    let { title, press_items: pressItems } =
      marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/other-pages/press`]?.data?.story?.content || {};
    if (pressItems && pressItems.length) {
      pressItems = pressItems.filter((item) => item.show_pages && item.show_pages.includes(pageName));
    }
    return {
      title,
      pressItems,
    };
  }, [marketing, pageName]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/other-pages/press`))
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [dispatch]);
  if (loading) {
    return (
      <Box
        sx={{
          position: 'relative',
          height: {
            xs: 200,
            md: 300,
          },
        }}
      >
        <Spinner />
      </Box>
    );
  }
  if (!pressItems) return null;

  return (
    <Stack
      justifyContent="center"
      sx={[
        {
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          flexGrow: 1,
        }}
      >
        {/* Header */}
        <Stack
          justifyContent="center"
          alignItems="flex-start"
          sx={{
            mx: 5,
          }}
        >
          <Typography level="h2" noWrap>
            {pressTitle}
          </Typography>
          {desktop && <GhostArrowBtn text="View All" border={false} href={getUrl('press')} />}
        </Stack>
        {/* Content */}
        <Grid
          container
          px={{
            xs: 5,
            lg: 10,
          }}
          sx={{
            flex: 1,
            flexGrow: 1,
          }}
        >
          {pressItems.map((item, i) => (
            <Grid
              key={i}
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                '& > div': {
                  width: '100%',
                  maxWidth: 230,
                },
              }}
              xs={6}
              sm={3}
            >
              <ReactPicture
                src={item.press_logo}
                alt={item.press_name}
                loader={{ ratio: item.ratio || 0.75, objectFit: 'contain' }}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
      {!desktop && (
        <Stack justifyContent="center" alignItems="center">
          <GhostArrowBtn text="View All" href={getUrl('press')} />
        </Stack>
      )}
    </Stack>
  );
};

PressSection.propTypes = {
  pageName: PropTypes.string,
  sx: PropTypes.object,
};

const LazyPressSection = (props) => {
  const { desktop } = useBreakpoints();
  return (
    <LazyLoad offset={200} once height={!desktop ? 200 : 120}>
      <PressSection {...props} />
    </LazyLoad>
  );
};

export default LazyPressSection;
