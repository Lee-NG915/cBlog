import 'sass/base.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { loadableReady } from '@loadable/component';
import RootEntry from 'client/RootEntry';
import { getUserDevice } from 'utils/device';

const dest = document.querySelector('#root');

loadableReady(() => {
  ReactDOM.hydrate(
    <RootEntry
      appContext={{
        device: getUserDevice(),
      }}
    />,
    dest
  );
});
