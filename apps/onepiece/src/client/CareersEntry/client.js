import 'sass/base.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { loadableReady } from '@loadable/component';
import CareersEntry from 'client/CareersEntry';
import GraduateEntry from 'client/CareersEntry/Graduate';
import { getUserDevice } from 'utils/device';

const dest = document.querySelector('#root');

loadableReady(() => {
  // [Optimize] use router
  const isDetail = location.pathname.includes('/careers-list');
  const isGraduatePage = location.pathname.includes('/graduate-programme');
  ReactDOM.hydrate(
    isGraduatePage ? (
      <GraduateEntry
        appContext={{
          device: getUserDevice(),
        }}
      />
    ) : (
      <CareersEntry
        isDetail={isDetail}
        appContext={{
          device: getUserDevice(),
        }}
      />
    ),
    dest
  );
});
