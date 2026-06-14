import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';

/**
 * Log a warning and show a toast!
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const rtkQueryErrorLogger: Middleware = (api: MiddlewareAPI) => (next) => (action) => {
  // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
  if (isRejectedWithValue(action)) {
    console.warn('We got a rejected action!');
    if (action.type.includes('executeMutation/rejected')) {
      alert(action.error.message);
    }
    // toast.warn({
    //   title: 'Async error!',
    //   message:
    //     'data' in action.error
    //       ? (action.error.data as { message: string }).message
    //       : action.error.message,
    // });
  }

  return next(action);
};
