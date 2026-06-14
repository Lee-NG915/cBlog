import { HYDRATE } from 'next-redux-wrapper';
import { Action, PayloadAction } from '@reduxjs/toolkit';
type RootState = unknown; // normally inferred from state

export function isHydrateAction(
  action: Action
): action is PayloadAction<RootState> {
  return action.type === HYDRATE;
}
