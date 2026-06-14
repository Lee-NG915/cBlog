import { buildCreateSlice, asyncThunkCreator } from '@reduxjs/toolkit';

/**
 * https://redux-toolkit.js.org/api/createslice#createasyncthunk
 * name is up to you
 */
export const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});
