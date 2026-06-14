import React from 'react';

import { DualBox } from 'components/DualBox';
import ReactPicture from 'components/ReactPicture';
import { Carousel } from 'components/Carousel';

import { Container, Typography, Box } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import DepartmentIntro from './DepartmentIntro';
import BipAndTrain from './BipAndTrain';
import ApplyAndEnd from './ApplyAndEnd';
import style from './style.scss';

const baseImgUrl = 'https://res.cloudinary.com/castlery/image/upload/f_auto';
const departmentIntros = [
  {
    title: 'Retail Excellence',
    img: `${baseImgUrl}/v1710313831/static/careers/carousel/marketing-new.png`,
    btnLink: 'https://grnh.se/769240a14us',
    description:
      'The Retail Excellence Track provides focused rotations in Marketing, Country Growth, Customer Experience, and Showroom Sales. This hands-on experience delves deep into revenue planning, offline and online channel sales, and store experience – offering a comprehensive understanding of key retail disciplines.',
  },
  {
    title: 'Product Strategy',
    img: `${baseImgUrl}/v1710313650/static/careers/carousel/ecommerce.png`,
    btnLink: 'https://grnh.se/1676c5b94us',
    description:
      'Embark on rotations through Category Planning, Buying, and Category Growth. Gain practical experience by ideating innovative products, conducting revenue planning and managing costing for a comprehensive understanding of the strategy process.',
  },
];
export default () => {
  const { desktop } = useBreakpoints();
  const isMobile = !desktop;
  return (
    <Container className={`${style.desContent}`}>
      <Box id="positions">
        <Carousel className={`${style.desContent}__positions`}>
          {departmentIntros.map((department, index) => (
            <DualBox
              key={index}
              containerClassName={`${style.desContent}__position`}
              leftClassName={`${style.desContent}__position__img`}
              rightClassName={`${style.desContent}__position__apply`}
              leftComponent={
                <Box
                  sx={{
                    position: 'relative',
                    height: '100%',
                  }}
                >
                  <ReactPicture
                    key={index}
                    srcset={department.img}
                    alt="graduate-programme"
                    loader={{
                      // ratio: isMobile ? 1.2 : '0.5',
                      height: isMobile ? '300px' : '100%',
                      // width: '100%',
                      // sizes: isMobile ? ['1'] : ['0.5'],
                      objectFit: 'cover',
                    }}
                    lazy={false}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                    }}
                  >
                    <Typography level="h3" textColor="brand.charcoal.0">
                      {department.title}
                    </Typography>
                  </Box>
                </Box>
              }
              rightComponent={
                <>
                  <DepartmentIntro description={department.description} url={department.btnLink} />
                </>
              }
            />
          ))}
        </Carousel>
      </Box>

      <BipAndTrain />

      <ApplyAndEnd />
    </Container>
  );
};
