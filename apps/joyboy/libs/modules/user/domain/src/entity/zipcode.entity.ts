import { createEntityAdapter } from '@reduxjs/toolkit';

type Zipcode = {
  city: string;
  state: string;
  zipcode: string;
};
export const addressAdapter = createEntityAdapter<Zipcode>();
export type { Zipcode };
