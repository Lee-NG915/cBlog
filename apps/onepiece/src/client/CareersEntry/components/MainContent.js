import React from 'react';
import { GhostArrowBtn } from 'components/Button';
import { DualBox } from 'components/DualBox';
import ReactPicture from 'components/ReactPicture';
import { useBreakpoints } from '@castlery/fortress/hooks';
import { Container } from '@castlery/fortress';

import PropTypes from 'prop-types';

const MainContent = ({ isDetail, intro, hostUrl, rightImageSrc, style }) => {
  const breakpoints = useBreakpoints() || {};
  const { desktop: isDesktop } = breakpoints;
  const isMobile = !isDesktop;
  return (
    <Container>
      {!isDetail && (
        <DualBox
          containerClassName={`${style.common}__intro`}
          leftComponent={
            <>
              <h1>{intro.title}</h1>
              <p>{intro.desc}</p>
              {!isMobile && (
                <>
                  <GhostArrowBtn
                    className={`${style.careers}__openPosition`}
                    text="See Open Positions"
                    hasArrow={false}
                    href="#grnhse_app"
                  />

                  {/* <GhostArrowBtn
                    className={`${style.careers}__openPosition`}
                    text="Graduate Programme"
                    hasArrow={false}
                    href={`${hostUrl}/careers/graduate-programme`}
                  /> */}
                </>
              )}
            </>
          }
          rightComponent={
            <>
              <ReactPicture
                srcset={rightImageSrc}
                alt="Careers"
                loader={{
                  ratio: isMobile ? 1.2 : 1.4,
                  height: isMobile ? '' : '100%',
                  sizes: isMobile ? ['1'] : ['0.5'],
                }}
                lazy={false}
              />
              {isMobile && (
                <>
                  <GhostArrowBtn
                    className={`${style.careers}__openPosition ${style.careers}__openPosition__apply`}
                    text="See Open Positions"
                    hasArrow={false}
                    width={210}
                    href="#grnhse_app"
                  />
                  {/* <GhostArrowBtn
                    className={`${style.careers}__openPosition`}
                    text="Graduate Programme"
                    hasArrow={false}
                    href={`${hostUrl}/careers/graduate-programme`}
                  /> */}
                </>
              )}
            </>
          }
          whichIsTop="right"
        />
      )}
      <div id="grnhse_app" style={{ minHeight: isDetail ? '800px' : '400px' }} />
    </Container>
  );
};

MainContent.propTypes = {
  isDetail: PropTypes.bool,
  intro: PropTypes.object,
  hostUrl: PropTypes.string,
  rightImageSrc: PropTypes.string,
  style: PropTypes.object,
};

export default MainContent;
