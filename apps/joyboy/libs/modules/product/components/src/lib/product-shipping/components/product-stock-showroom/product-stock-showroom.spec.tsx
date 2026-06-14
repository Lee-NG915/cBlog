import { render, screen } from '@testing-library/react';
import { ProductStockShowroom } from './product-stock-showroom';
import {
  selectBundleVariants,
  selectCurrentProductStockState,
  selectLeadtimeShippingFee,
  selectVariant,
} from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { STOCK_STATE } from '@castlery/utils';

jest.mock('@castlery/utils', () => ({
  STOCK_STATE: {
    IN_STOCK: 'in_stock',
    OUT_OF_STOCK: 'out_of_stock',
  },
}));

jest.mock('@castlery/config', () => ({
  EcEnv: {
    NEXT_PUBLIC_APPLICATION_ENV: 'test',
    NEXT_PUBLIC_COUNTRY: 'SG',
  },
  enableWebHasShowroom: true,
}));

jest.mock('@castlery/shared-redux-store', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('@castlery/modules-product-domain', () => ({
  selectBundleVariants: jest.fn(),
  selectCurrentProductStockState: jest.fn(),
  selectLeadtimeShippingFee: jest.fn(),
  selectVariant: jest.fn(),
}));

jest.mock('@castlery/fortress', () => ({
  Link: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Stack: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@castlery/fortress/Icons', () => ({
  ArrowForwardIos: () => null,
}));

jest.mock('./product-stock-showroom-drawer', () => ({
  ProductStockShowroomDrawer: () => null,
}));

const mockedUseAppSelector = useAppSelector as jest.Mock;

const setupSelectors = ({
  retailDetails = [],
  stockState = STOCK_STATE.IN_STOCK,
}: {
  retailDetails?: Array<{ stock_state: string }>;
  stockState?: string;
} = {}) => {
  mockedUseAppSelector.mockImplementation((selector) => {
    if (selector === selectVariant) {
      return { id: 'variant-1' };
    }
    if (selector === selectLeadtimeShippingFee) {
      return {
        retail_details: retailDetails,
      };
    }
    if (selector === selectCurrentProductStockState) {
      return stockState;
    }
    if (selector === selectBundleVariants) {
      return null;
    }
    return null;
  });
};

describe('ProductStockShowroom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows viewing copy and showroom link without unavailable copy when showroom stock exists even if stockState is out of stock', () => {
    setupSelectors({
      retailDetails: [{ stock_state: STOCK_STATE.IN_STOCK }],
      stockState: STOCK_STATE.OUT_OF_STOCK,
    });

    render(<ProductStockShowroom />);

    expect(screen.getByText('Item is available for viewing.')).toBeTruthy();
    expect(screen.getByText('Find showroom')).toBeTruthy();
    expect(screen.queryByText('Currently unavailable.')).toBeNull();
  });

  it('shows only showroom link when no showroom stock exists and the item is not out of stock', () => {
    setupSelectors({
      retailDetails: [{ stock_state: STOCK_STATE.OUT_OF_STOCK }],
      stockState: STOCK_STATE.IN_STOCK,
    });

    render(<ProductStockShowroom />);

    expect(screen.queryByText('Item is available for viewing.')).toBeNull();
    expect(screen.getByText('Find showroom')).toBeTruthy();
    expect(screen.queryByText('Currently unavailable.')).toBeNull();
  });

  it('shows unavailable copy and hides showroom link when no showroom stock exists and the item is out of stock', () => {
    setupSelectors({
      retailDetails: [{ stock_state: STOCK_STATE.OUT_OF_STOCK }],
      stockState: STOCK_STATE.OUT_OF_STOCK,
    });

    render(<ProductStockShowroom />);

    expect(screen.queryByText('Item is available for viewing.')).toBeNull();
    expect(screen.queryByText('Find showroom')).toBeNull();
    expect(screen.getByText('Currently unavailable.')).toBeTruthy();
  });
});
