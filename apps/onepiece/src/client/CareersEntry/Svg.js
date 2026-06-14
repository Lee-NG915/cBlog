import React from 'react';

/* remove the attribute stroke if the icon is painted by stroke 
      remove the attribute fill if the icon needs fill color
      make the icon transparent
      svg zipping website: https://www.zhangxinxu.com/sp/svgo/ (Note: it may remove the strokWidth)
    */

const Svg = () => (
  <>
    <svg id="line-left-arrow" viewBox="0 0 27 22">
      <path
        strokeWidth="1"
        d="M26 11H0m0 0l10.62 10M0 11L10.62 1"
        fill="none"
        fillRule="evenodd"
        strokeDasharray="0,0"
        strokeLinecap="round"
      />
    </svg>
    <svg id="line-right-arrow" viewBox="0 0 27 22">
      <path
        strokeWidth="1"
        d="M0 11h26m0 0L15.38 1M26 11L15.38 21"
        fill="none"
        fillRule="evenodd"
        strokeDasharray="0,0"
        strokeLinecap="round"
      />
    </svg>

    <symbol id="warning" viewBox="0 0 18 19">
      <path d="M9 14.04a.623.623 0 0 0 .438-.175.56.56 0 0 0 .187-.425.589.589 0 0 0-.187-.45.623.623 0 0 0-.438-.175.623.623 0 0 0-.438.175.589.589 0 0 0-.187.45.56.56 0 0 0 .187.425.623.623 0 0 0 .438.175zm-.5-3.3h1v-6h-1v6zm.5 7.85c-1.25 0-2.42-.238-3.512-.712a9.142 9.142 0 0 1-2.85-1.926 9.143 9.143 0 0 1-1.926-2.85A8.709 8.709 0 0 1 0 9.59c0-1.25.237-2.421.712-3.513a9.159 9.159 0 0 1 1.926-2.85 9.152 9.152 0 0 1 2.85-1.925A8.709 8.709 0 0 1 9 .59c1.25 0 2.421.237 3.513.712a9.168 9.168 0 0 1 2.85 1.925 9.167 9.167 0 0 1 1.925 2.85A8.715 8.715 0 0 1 18 9.59c0 1.25-.237 2.42-.712 3.512a9.151 9.151 0 0 1-1.925 2.85 9.158 9.158 0 0 1-2.85 1.926A8.715 8.715 0 0 1 9 18.59z" />
    </symbol>
  </>
);

export default Svg;
