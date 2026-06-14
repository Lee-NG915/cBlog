import React from 'react';
import { DualBox } from 'components/DualBox';
import ReactPicture from 'components/ReactPicture';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import CloseTip from './CloseTip';
import style from './style.scss';

const ApplyAndEnd = () => {
  const { desktop } = useBreakpoints();
  const isMobile = !desktop;
  return (
    <DualBox
      containerClassName={`${style.ApplyAndEnd}`}
      leftClassName={`${style.ApplyAndEnd}__left`}
      rightClassName={`${style.ApplyAndEnd}__right`}
      leftComponent={
        <div>
          <h3>What’s Our Application Process like?</h3>
          <div className={`${style.ApplyAndEnd}__left__process`}>
            {/* <ProcessSteps Steps={processSteps} /> */}
            <ReactPicture
              srcset="https://res.cloudinary.com/castlery/image/upload/f_auto/v1710237627/static/careers/process.png"
              alt="graduate-programme"
              loader={{
                // ratio: isMobile ? 1.2 : '0.5',
                width: '100%',
                sizes: isMobile ? ['1'] : ['0.5'],
              }}
              lazy={false}
            />
          </div>
          <div className={`${style.ApplyAndEnd}__left__des`}>
            <p>Graduates from various disciplines with less than 3 years of working experience are welcome to apply!</p>
            <p>
              Check out our <a href="https://www.linkedin.com/company/castlery-com">LinkedIn</a>.
            </p>
            {!__OPEN_GRADUATE_APPLICATION__ && <CloseTip />}
          </div>
        </div>
      }
      rightComponent={
        <div>
          <h3>What’s Waiting For You at the End of the Programme?</h3>
          <div className={`${style.ApplyAndEnd}__right__des`}>
            <p>
              You will be offered a fixed permanent role according to what interests you and the positions that we are
              able to offer.
            </p>
            {/* <p>
              See what our Graduate Programme participants have gone through{' '}
              <a href="https://www.linkedin.com/feed/hashtag/?keywords=CastleryGradLife">here</a>.
            </p> */}
          </div>
        </div>
      }
    />
  );
};

export default ApplyAndEnd;
