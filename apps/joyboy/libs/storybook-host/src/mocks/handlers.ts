import { http, HttpResponse } from 'msw';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { User } from '@castlery/types';
import { EcEnv } from '@castlery/config';
// import { Post } from '../app-core/services/post';

// We're just going to use a simple in-memory store for both the counter and posts
// The entity adapter will handle modifications when triggered by the MSW handlers

const adapter = createEntityAdapter<User>();

let state = adapter.getInitialState();
state = adapter.setOne(state, {
  channel: 'web',
  email: '',
  firstname: '',
  profile: {},
});

export { state };

export const handlers = {
  oauth: [
    http.post(`${EcEnv.NEXT_PUBLIC_APPLICATION_ENV}oauth/token`, () => {
      return HttpResponse.json({
        grant_type: 'refresh_token',
        refresh_token: '9677949c808a4fb62a59740d2f232f4245984f1cac2702bbe382f062eeda8e6f',
        type: 'mock',
      });
    }),
  ],
  other: [],
};
