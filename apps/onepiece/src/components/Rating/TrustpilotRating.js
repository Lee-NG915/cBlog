import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@castlery/fortress';

let starIdCounter = 0;

const Star = ({ filled = true, fillPercentage = 100 }) => {
  const starId = React.useMemo(() => `star-${++starIdCounter}`, []);

  if (filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 28 26" fill="none">
        <path
          d="M28 9.93637H17.3078L14.0051 0L10.6922 9.93637L0 9.92647L8.65914 16.0735L5.34594 26L14.0051 19.8628L22.6537 26L19.351 16.0735L28 9.93637Z"
          fill="#844025"
        />
        <path d="M20.0909 18.3211L19.3478 16.0737L14.0029 19.863L20.0909 18.3211Z" fill="#5E2D1A" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 28 26" fill="none">
      <defs>
        <mask id={`star-mask-${starId}`}>
          <path
            d="M28 9.93637H17.3078L14.0051 0L10.6922 9.93637L0 9.92647L8.65914 16.0735L5.34594 26L14.0051 19.8628L22.6537 26L19.351 16.0735L28 9.93637Z"
            fill="white"
          />
        </mask>
      </defs>

      {/* 星星轮廓 */}
      <path
        d="M28 9.93637H17.3078L14.0051 0L10.6922 9.93637L0 9.92647L8.65914 16.0735L5.34594 26L14.0051 19.8628L22.6537 26L19.351 16.0735L28 9.93637Z"
        // fill="#E5D1C6"
        stroke="#844025"
        strokeWidth="1"
      />

      {/* 填充部分 */}
      {fillPercentage > 0 && (
        <g>
          <defs>
            <clipPath id={`clip-${starId}`}>
              <rect x="0" y="0" width={`${fillPercentage}%`} height="100%" />
            </clipPath>
          </defs>
          <path
            d="M28 9.93637H17.3078L14.0051 0L10.6922 9.93637L0 9.92647L8.65914 16.0735L5.34594 26L14.0051 19.8628L22.6537 26L19.351 16.0735L28 9.93637Z"
            fill="#844025"
            clipPath={`url(#clip-${starId})`}
          />
        </g>
      )}
    </svg>
  );
};

Star.propTypes = {
  filled: PropTypes.bool,
  fillPercentage: PropTypes.number,
};

const TrustpilotRating = ({ rating, size = 28 }) => {
  const fullStars = Math.floor(rating);
  const partialFill = Math.round((rating % 1) * 100); // 将小数部分转换为百分比

  return (
    <Box display="flex" gap={1} alignItems="center">
      {[...Array(fullStars)].map((_, index) => (
        <Star key={`full-${index}`} filled />
      ))}
      {fullStars < 5 && <Star key="partial" filled={false} fillPercentage={partialFill} />}
      {[...Array(4 - fullStars)].map((_, index) => (
        <Star key={`empty-${index}`} filled={false} fillPercentage={0} />
      ))}
    </Box>
  );
};

TrustpilotRating.propTypes = {
  rating: PropTypes.number.isRequired,
  size: PropTypes.number,
};

export default TrustpilotRating;
