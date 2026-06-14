import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { PayloadAction } from '@reduxjs/toolkit';
import { SaleListResp, Order } from '../entity/sale-list.entity';
import { saleListEvent } from '../event/sale-list.event';

type SaleListState = {
  saleListInfo: SaleListResp;
  saleListRowInfo: Order;
  currentPage?: number | null;
  detailJumpPage?: number | null;
};

export const saleListSlice = createSliceWithThunks({
  name: 'saleList',
  initialState: {
    saleListInfo: {},
    saleListRowInfo: {},
  } as SaleListState,
  reducers: (create) => {
    return {
      setSaleListInfo: create.reducer((state, { payload }: PayloadAction<SaleListResp>) => {
        state.saleListInfo = payload;
      }),
      setSaleListRowInfo: create.reducer((state, { payload }: PayloadAction<Order>) => {
        state.saleListRowInfo = payload;
      }),
      setCurrentPage: create.reducer((state, { payload }: PayloadAction<number | null>) => {
        state.currentPage = payload;
      }),
      setDetailJumpPage: create.reducer((state, { payload }: PayloadAction<number | null>) => {
        state.detailJumpPage = payload;
      }),
    };
  },
  extraReducers(builder) {
    builder.addMatcher(saleListEvent, (state, action: PayloadAction<SaleListResp>) => {
      state.saleListInfo = action.payload;
    });
  },
  selectors: {
    selectSaleListInfo: (state) => state.saleListInfo,
    selectSalesListRowInfo: (state) => state.saleListRowInfo,
    selectCurrentPage: (state) => state.currentPage,
    selectDetailJumpPage: (state) => state.detailJumpPage,
  },
});

export const { setSaleListInfo, setSaleListRowInfo, setCurrentPage, setDetailJumpPage } = saleListSlice.actions;
export const { selectSaleListInfo, selectSalesListRowInfo, selectCurrentPage, selectDetailJumpPage } =
  saleListSlice.selectors;
export type SaleListSlice = typeof saleListSlice;
