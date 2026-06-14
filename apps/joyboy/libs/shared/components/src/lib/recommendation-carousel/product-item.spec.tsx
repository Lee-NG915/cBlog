import React from 'react';
import { render, screen } from '@testing-library/react';
import { SingleProductItem } from './product-item';

// ── FortressImage mock: expose objectFit as data attribute ──────────────────
jest.mock('../fortress-image/fortress-image', () => ({
  FortressImage: ({ objectFit, src, alt }: { objectFit?: string; src?: string; alt?: string }) => (
    <img data-testid="fortress-image" data-object-fit={objectFit} src={src} alt={alt} />
  ),
}));

// ── CustomLink mock ──────────────────────────────────────────────────────────
jest.mock('../custom-link/custom-link', () => ({
  CustomLink: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

// ── @castlery/fortress ───────────────────────────────────────────────────────
const mockUseBreakpoints = jest.fn();
jest.mock('@castlery/fortress', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  IconButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  Stack: ({ children, sx, ...rest }: any) => <div {...rest}>{children}</div>,
  Typography: ({ children }: any) => <span>{children}</span>,
  useBreakpoints: () => mockUseBreakpoints(),
  Loading: () => <div data-testid="loading" />,
}));

// ── @castlery/fortress/Icons ─────────────────────────────────────────────────
jest.mock('@castlery/fortress/Icons', () => ({
  Check: () => <svg />,
  Favorite: () => <svg />,
  ShoppingBag: () => <svg />,
}));

// ── Redux ────────────────────────────────────────────────────────────────────
const mockDispatch = jest.fn();
const mockUseAppSelector = jest.fn();
jest.mock('@castlery/shared-redux-store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

jest.mock('@castlery/modules-order-domain', () => ({
  selectOrder: 'selectOrder',
  setOrder: jest.fn(),
}));

jest.mock('@castlery/modules-user-domain', () => ({
  addWishlist: { initiate: jest.fn() },
  deleteWishlist: { initiate: jest.fn() },
  selectedWishList: 'selectedWishList',
  setWishList: jest.fn(),
  updateWishlistActionRecord: jest.fn(),
}));

// ── Service / tracking mocks ─────────────────────────────────────────────────
jest.mock('@castlery/modules-cms-services', () => ({
  addToOrder: jest.fn(),
  getProductBySKU: jest.fn(),
}));

jest.mock('@castlery/modules-product-domain', () => ({
  toPrice: (price: string) => `$${price}`,
}));

jest.mock('@castlery/modules-tracking-services', () => ({
  EVENT_ADD_TO_CART: jest.fn(),
  EVENT_ADD_TO_WISHLIST: jest.fn(),
  EVENT_STORYBLOK: jest.fn(),
  getProductNeedTracking: jest.fn(),
}));

// ── Next.js ──────────────────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// ── react-slick ──────────────────────────────────────────────────────────────
jest.mock('react-slick', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="slider">{children}</div>,
}));

// ── Shared test data ─────────────────────────────────────────────────────────
const mockProduct = {
  sku: 'TEST-001',
  badges: [],
  images: {
    base: 'https://example.com/base.jpg',
    lifestyle: 'https://example.com/lifestyle.jpg',
  },
  inStock: true,
  name: 'Test Product',
  price: 100,
  salePrice: '',
  productShortDescription: 'Test description',
  spuName: 'Test SPU',
  url: '/test-product',
  variantId: '123',
};

beforeEach(() => {
  jest.clearAllMocks();
  // desktop: false → hit the default branch in renderImagePart
  mockUseBreakpoints.mockReturnValue({ desktop: false });
  // selectOrder → null (no active order), selectedWishList → [] (empty)
  mockUseAppSelector.mockReturnValueOnce(null).mockReturnValueOnce([]);
});

describe('SingleProductItem — objectFit based on imageType', () => {
  it('uses objectFit="cover" when imageType is lifestyle_image', () => {
    render(<SingleProductItem product={mockProduct} imageType="lifestyle_image" />);
    const images = screen.getAllByTestId('fortress-image');
    expect(images[0].getAttribute('data-object-fit')).toBe('cover');
  });

  it('uses objectFit="contain" when imageType is base_image', () => {
    mockUseAppSelector.mockReturnValueOnce(null).mockReturnValueOnce([]);
    render(<SingleProductItem product={mockProduct} imageType="base_image" />);
    const images = screen.getAllByTestId('fortress-image');
    expect(images[0].getAttribute('data-object-fit')).toBe('contain');
  });

  it('uses objectFit="contain" when no imageType provided (default)', () => {
    mockUseAppSelector.mockReturnValueOnce(null).mockReturnValueOnce([]);
    render(<SingleProductItem product={mockProduct} />);
    const images = screen.getAllByTestId('fortress-image');
    expect(images[0].getAttribute('data-object-fit')).toBe('contain');
  });
});

describe('SingleProductItem — internal path conversion', () => {
  it('uses internal path for absolute product url', () => {
    mockUseAppSelector.mockReturnValueOnce(null).mockReturnValueOnce([]);
    render(
      <SingleProductItem
        product={{
          ...mockProduct,
          url: 'https://www.castlery.com/us/products/test-product?from=reco#details',
        }}
      />
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/us/products/test-product?from=reco#details');
  });

  it('keeps relative product url unchanged', () => {
    mockUseAppSelector.mockReturnValueOnce(null).mockReturnValueOnce([]);
    render(
      <SingleProductItem
        product={{
          ...mockProduct,
          url: '/us/products/test-product?from=reco#details',
        }}
      />
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/us/products/test-product?from=reco#details');
  });
});
