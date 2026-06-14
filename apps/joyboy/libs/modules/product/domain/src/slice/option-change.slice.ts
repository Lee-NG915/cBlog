import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { STOCK_STATE } from '@castlery/utils';

type ProductOptionState = {
  init: boolean;
  customisable: boolean;
  realCustomisable: boolean;
  quantity: number;
  selected: Record<string, any>;
  variantId: string;
  selectedVariants: Record<string, any>;
  variantVersions: {
    batchOfVariant: Array<{
      variant_id: number;
      option_types: string;
      is_customized: boolean;
      discontinued: boolean;
      batch: number;
    }>;
    index: number;
  };
  bundleInit: boolean;
  bundleProduct: Record<string, any>;
  bundleSelected: Record<string, any>;
  bundleVariant: Record<string, any>;
  currentReviewIndex: number;
  productSlug: string;
  estimating: boolean;
  deliveryLeadTimeDisplay: string;
  warehouseName: string;
  stockState: string;
  city: string | null;
  prevCorrectCity: string | null;
  isLongLeadTime: boolean;
  retailIds: number[];
};

const initialStateProductOptionState: ProductOptionState = {
  init: false,
  customisable: false,
  realCustomisable: false,
  quantity: 1,
  selected: {},
  variantId: '',
  selectedVariants: {},
  variantVersions: {
    batchOfVariant: [
      // {
      //   variant_id: 19393,
      //   option_types: '9:329;12:283;15:353',
      //   is_customized: false,
      //   discontinued: false,
      //   batch: 1,
      // },
    ],
    index: 1,
  },
  // for bundle cache
  bundleInit: false,
  bundleProduct: {},
  bundleSelected: {},
  bundleVariant: {},
  // for review
  currentReviewIndex: 0,
  // for display
  productSlug: '',
  estimating: false,
  deliveryLeadTimeDisplay: '',
  warehouseName: '',
  stockState: STOCK_STATE.IN_STOCK,
  city: null,
  prevCorrectCity: null,
  isLongLeadTime: false,
  retailIds: [],
};

export const productOptionSlice = createSliceWithThunks({
  name: 'productOption',
  initialState: initialStateProductOptionState as ProductOptionState,
  reducers: (create) => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setProductQuantity: create.asyncThunk(async ({ quantity }: { quantity: number }, { extra }) => {
        return { quantity };
      }),
    };
  },
  extraReducers: (builder) => {
    builder.addCase(setProductQuantity.fulfilled, (state, action) => {
      console.log(action.payload.quantity, 'action.payload.quantity');
      state.quantity = action.payload.quantity;
    });
  },
  selectors: {
    selectProductQuantity: (state: ProductOptionState) => state.quantity,
    selectProductOption: (state: ProductOptionState) => state,
  },
});

export const productOptionReducer = productOptionSlice.reducer;
export const { setProductQuantity } = productOptionSlice.actions;
export const { selectProductQuantity, selectProductOption } = productOptionSlice.selectors;
