import React from 'react';
import { wrapPage } from 'utils/page';
import style from './style.scss';

const matterportId = {
  US: 'eJtGBpZpirN',
  SG: 'dxLjqydB8VQ',
  AU: 'eVRBvX9MNj3',
};

const VirtualStudio = () => (
  <div className={style.virtualStudio}>
    <iframe
      width="853"
      height="480"
      title="virtual-studio"
      className={`${style.virtualStudio}__iframe`}
      src={`https://my.matterport.com/show/?m=${matterportId[__COUNTRY__]}&play=1`}
      frameBorder="0"
      allowFullScreen
      allow="vr"
    />
  </div>
);

export default wrapPage({ hideHeaderFooter: true })(VirtualStudio);
