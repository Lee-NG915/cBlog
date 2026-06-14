import { createAsyncThunk } from '@reduxjs/toolkit';
import { formatGoogleAddressByPlaceId } from '@castlery/modules-user-domain';

export const formatGoogleAddress = createAsyncThunk(
  'address/formatGoogleAddress',
  async (placeId: string, { dispatch }) => {
    const res = await dispatch(formatGoogleAddressByPlaceId.initiate(placeId)).unwrap();
    return res;
  }
);
