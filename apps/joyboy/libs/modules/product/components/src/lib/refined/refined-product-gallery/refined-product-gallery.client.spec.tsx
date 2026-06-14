import { forwardRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { RefinedProductGalleryClient } from './refined-product-gallery.client';

const mockUseSelector = jest.fn();
const mockDispatch = jest.fn();
const mockUseFirstInView = jest.fn();
const mockBreakpoints = { desktop: true, tablet: false, mobile: false };
const inViewCallbacksByTestId = new Map<string, () => void>();
const omitLayoutProps = ({
  alignItems,
  component,
  flexDirection,
  justifyContent,
  level,
  mt,
  mb,
  px,
  py,
  sx,
  variant,
  ...props
}) => props;

jest.mock('@castlery/fortress', () => ({
  Box: forwardRef(({ children, onClick, ...props }: any, ref) => (
    <div ref={ref} onClick={onClick} {...omitLayoutProps(props)}>
      {children}
    </div>
  )),
  IconButton: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...omitLayoutProps(props)}>
      {children}
    </button>
  ),
  Link: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...omitLayoutProps(props)}>
      {children}
    </button>
  ),
  Stack: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  Typography: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  useBreakpoints: () => mockBreakpoints,
}));

jest.mock('@castlery/fortress/Icons', () => ({
  ThreeDRotation: () => <span>3d</span>,
  ViewInAr: () => <span>ar</span>,
}));

jest.mock('@castlery/modules-product-domain', () => ({
  selectBundleVariants: Symbol('selectBundleVariants'),
  selectProduct: Symbol('selectProduct'),
  selectVariant: Symbol('selectVariant'),
}));

jest.mock('@castlery/modules-product-services', () => ({
  mergeAndSortArrays: jest.fn((images = [], assets = []) => [...images, ...assets]),
  handleImagesSort: jest.fn((items) => items),
}));

jest.mock('@castlery/shared-redux-store', () => ({
  useSelector: (selector) => mockUseSelector(selector),
  useAppDispatch: () => mockDispatch,
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/products/test-sofa',
  useSearchParams: () => ({
    toString: () => '',
  }),
}));

jest.mock('../../../hooks/use-compatibility', () => ({
  useCompatibility: () => ({ supports3D: false, supportsAR: false }),
}));

jest.mock('../../../hooks/use-hash', () => ({
  useHash: () => '',
}));

jest.mock('../../image-gallery/hooks/use-slick-auto-scroll', () => ({
  useSlickAutoScroll: jest.fn(),
}));

jest.mock('@castlery/observability/client', () => ({
  logger: { error: jest.fn() },
}));

jest.mock('@castlery/modules-tracking-services', () => ({
  EVENT_PDP_IMAGE_IMPRESSION: jest.fn((payload) => payload),
  EVENT_PDP_DETAILS: jest.fn((payload) => payload),
}));

jest.mock('@castlery/modules-tracking-components', () => ({
  useFirstInView: (...args) => mockUseFirstInView(...args),
}));

jest.mock('./components/media-item', () => ({
  MediaItem: ({ media, index, renderContext }) => (
    <div data-testid={`media-item-${index}`} data-type={media.type} data-context={renderContext}>
      {media.type}
    </div>
  ),
}));

jest.mock('./components/thumbnail-image', () => ({
  ThumbnailImage: ({ index }) => <div data-testid={`thumb-${index}`} />,
}));

jest.mock('../../product-enlarged-gallery-viewer/product-enlarged-gallery-viewer', () => ({
  ProductEnlargedGalleryViewer: ({ open, initialIndex, galleryList }) => (
    <div
      data-testid={
        galleryList?.[0]?.type === 'dimension' || galleryList?.length <= 1 ? 'dimension-viewer' : 'main-viewer'
      }
      data-open={String(open)}
      data-index={String(initialIndex)}
    />
  ),
}));

jest.mock('../../threed-ar/ar/ar-drawer', () => ({
  ARDrawer: () => null,
}));

jest.mock('../../threed-ar/sketchfab-viewer/sketchfab-viewer', () => ({
  SketchfabViewer: () => null,
}));

jest.mock('swiper/react', () => ({
  Swiper: ({ children, onSlideChange }) => (
    <div>
      <button data-testid="trigger-slide-change" onClick={() => onSlideChange?.({ activeIndex: 1 })} type="button" />
      {children}
    </div>
  ),
  SwiperSlide: ({ children }) => <div>{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  FreeMode: {},
  Mousewheel: {},
  Navigation: {},
  Scrollbar: {},
  Thumbs: {},
}));

jest.mock('swiper/css', () => ({}));
jest.mock('swiper/css/mousewheel', () => ({}));
jest.mock('swiper/css/navigation', () => ({}));
jest.mock('swiper/css/scrollbar', () => ({}));
jest.mock('swiper/css/thumbs', () => ({}));

describe('RefinedProductGalleryClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReset();
    inViewCallbacksByTestId.clear();
    mockUseFirstInView.mockImplementation((callback) => (node) => {
      const testId = node?.getAttribute?.('data-testid');
      if (testId) {
        inViewCallbacksByTestId.set(testId, callback);
      }
    });
    mockBreakpoints.desktop = true;
    mockBreakpoints.tablet = false;
    mockBreakpoints.mobile = false;

    const product = {
      name: 'Test Sofa',
      dimension_image: null,
      variants: [],
    };

    const selectedVariant = {
      id: 11,
      name: 'Default Variant',
      price: 1000,
      badges: [],
      images: [
        { type: 'base', links: { feed: 'https://cdn.example.com/base.jpg' } },
        { type: 'video', path: 'https://cdn.example.com/video.mp4' },
      ],
      assets: [],
      threed_images: undefined,
    };

    mockUseSelector.mockImplementation((selector) => {
      if (String(selector).includes('selectProduct')) return product;
      if (String(selector).includes('selectVariant')) return selectedVariant;
      return null;
    });
  });

  it('opens enlarge viewer with the clicked video index on desktop grid', () => {
    render(<RefinedProductGalleryClient />);

    expect(screen.getByTestId('main-viewer').getAttribute('data-open')).toBe('false');
    expect(screen.getByTestId('main-viewer').getAttribute('data-index')).toBe('0');

    fireEvent.click(screen.getByTestId('media-item-1').parentElement as HTMLElement);

    expect(screen.getByTestId('main-viewer').getAttribute('data-open')).toBe('true');
    expect(screen.getByTestId('main-viewer').getAttribute('data-index')).toBe('1');
  });

  it('dispatches desktop impressions when preview tiles first enter the viewport', () => {
    render(<RefinedProductGalleryClient />);

    expect(inViewCallbacksByTestId.has('desktop-impression-tile-1')).toBe(true);

    inViewCallbacksByTestId.get('desktop-impression-tile-1')?.();

    expect(mockDispatch).toHaveBeenCalledWith({
      assetPosition: 2,
      assetType: 'video',
    });
  });

  it('does not dispatch image impressions on desktop mount before tiles are observed', () => {
    mockUseFirstInView.mockImplementation(() => null);

    render(<RefinedProductGalleryClient />);

    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        assetPosition: expect.any(Number),
      })
    );
  });

  it('dispatches image impressions on mobile when the carousel index changes', () => {
    mockBreakpoints.desktop = false;
    mockBreakpoints.mobile = true;

    render(<RefinedProductGalleryClient />);

    fireEvent.click(screen.getAllByTestId('trigger-slide-change')[0]);

    expect(mockDispatch).toHaveBeenCalledWith({
      assetPosition: 2,
      assetType: 'video',
    });
  });
});
