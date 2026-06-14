import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Box, Container, Typography } from '@castlery/fortress';
import style from './style.scss';

const Banner = (props) => {
  const { className, image, title, subtitle } = props;
  return (
    <Box className={classNames(style.banner, className)}>
      <Container
        disableGutters
        sx={(theme) => ({
          backgroundImage: `url(${image})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          display: 'flex',
          color: theme.palette.brand.flour[10],
          position: 'relative',
          alignItems: 'center',
          minHeight: '170px',
          py: {
            xs: 4,
            lg: 6,
          },
          '&:before': {
            bgcolor: 'red',
          },
          // TODO 要处理添加一个蒙层
          // ':before': {
          //   content: ' ',
          //   display: 'block',
          //   position: 'absolute',
          //   left: 0,
          //   top: 0,
          //   width: '100%',
          //   height: '100%',
          //   bgcolor: 'red',
          // },
        })}
      >
        <Container
          fixed
          sx={{
            textAlign: 'center',
            '&:before': {
              bgcolor: 'red',
            },
          }}
        >
          <Typography level="h1" color="flour.10" textAlign="center">
            {title}
          </Typography>
          {subtitle && <p dangerouslySetInnerHTML={{ __html: subtitle }} />}
        </Container>
      </Container>
    </Box>
  );
};

Banner.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  className: PropTypes.string,
};

export default Banner;
