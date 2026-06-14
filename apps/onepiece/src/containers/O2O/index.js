import React from 'react';
import { asyncLoad } from 'components/AsyncLoad/utils';
import loadable from '@loadable/component';
import { loadIfNeeded } from 'redux/modules/showroomExclusives';

const ShowroomExclusives = loadable(() => import(/* webpackChunkName: "showroomExclusives" */ `./ShowroomExclusives`));

const Index = (props) => <ShowroomExclusives {...props} />;

export default asyncLoad([
  async ({ store: { dispatch } }) => {
    await dispatch(loadIfNeeded());
  },
])(Index);
