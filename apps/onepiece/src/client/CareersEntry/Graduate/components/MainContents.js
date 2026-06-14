import React from 'react';
import { GhostArrowBtn } from 'components/Button';
import { DualBox } from 'components/DualBox';
import ReactPicture from 'components/ReactPicture';
import { useBreakpoints } from '@castlery/fortress/hooks';
import CloseTip from 'components/Careers/Graduate/CloseTip';
import { Container } from '@castlery/fortress';

import PropTypes from 'prop-types';

const MainContent = ({ isDetail, intro, rightImageSrc, style }) => {
  const breakpoints = useBreakpoints() || {};
  const { desktop: isDesktop } = breakpoints;
  const isMobile = !isDesktop;
  return (
    <Container>
      {!isDetail && (
        <DualBox
          containerClassName={`${style.common}__intro ${style.graduate}__intro`}
          leftClassName={`${style.graduate}__intro__left`}
          rightClassName={`${style.graduate}__intro__right`}
          leftComponent={
            <>
              <h1>{intro.title}</h1>
              <p>{intro.desc}</p>
              {!__OPEN_GRADUATE_APPLICATION__ && <CloseTip className={`${style.graduate}__intro__closetip`} />}
              {/* <CloseTip className={`${style.graduate}__intro__closetip`} /> */}
              {!isMobile && __OPEN_GRADUATE_APPLICATION__ && (
                <GhostArrowBtn
                  className={`${style.graduate}__openPosition`}
                  text="Apply Now"
                  hasArrow={false}
                  href="#positions"
                />
              )}
            </>
          }
          rightComponent={
            <>
              <ReactPicture
                srcset={rightImageSrc}
                alt="graduate-programme"
                loader={{
                  ratio: isMobile ? 1.2 : 1.2,
                  height: isMobile ? '' : '100%',
                  sizes: isMobile ? ['1'] : ['0.5'],
                  objectFit: 'contain',
                }}
                lazy={false}
              />
              {isMobile && __OPEN_GRADUATE_APPLICATION__ && (
                <GhostArrowBtn
                  className={`${style.graduate}__openPosition`}
                  text="Apply Now"
                  hasArrow={false}
                  width={210}
                  href="#grnhse_app"
                />
              )}
            </>
          }
          whichIsTop="right"
        />
      )}
    </Container>
  );
};

MainContent.propTypes = {
  isDetail: PropTypes.bool,
  intro: PropTypes.object,
  rightImageSrc: PropTypes.string,
  style: PropTypes.object,
};

export default MainContent;
