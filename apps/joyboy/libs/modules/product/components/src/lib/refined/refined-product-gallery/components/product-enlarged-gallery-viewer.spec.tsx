import { act, fireEvent, render, screen } from '@testing-library/react';
import { forwardRef, useEffect as useReactEffect } from 'react';

import { ProductEnlargedGalleryViewer } from '../../../product-enlarged-gallery-viewer/product-enlarged-gallery-viewer';

const mockDispatch = jest.fn();
const mockTrackImage5S = jest.fn((payload) => payload);
const mockBreakpoints = { desktop: true };
const observerRecords = new Map<Element, IntersectionObserverCallback>();

const omitLayoutProps = ({
  alignItems,
  alignContent,
  direction,
  flexDirection,
  flexWrap,
  gap,
  height,
  justifyContent,
  minWidth,
  px,
  py,
  spacing,
  sx,
  variant,
  width,
  ...props
}) => props;
const omitSwiperProps = ({
  centeredSlides,
  children,
  freeMode,
  initialSlide,
  modules,
  mousewheel,
  onSlideChange,
  onSwiper,
  slidesPerView,
  spaceBetween,
  style,
  ...props
}) => props;
const mockSwiper = jest.fn(({ children, onSlideChange, ...props }) => (
  <div {...omitSwiperProps(props)}>
    <button data-testid="trigger-slide-change-1" onClick={() => onSlideChange?.({ activeIndex: 1 })} type="button" />
    {children}
  </div>
));

jest.mock('@castlery/fortress', () => ({
  Box: forwardRef(({ children, ...props }: any, ref) => (
    <div ref={ref} {...omitLayoutProps(props)}>
      {children}
    </div>
  )),
  DialogContent: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  DialogTitle: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  IconButton: ({ children, ...props }) => <button {...props}>{children}</button>,
  Link: ({ children, ...props }) => <button {...props}>{children}</button>,
  Modal: ({ children, open }) => (open ? <div>{children}</div> : null),
  ModalClose: () => <button>close</button>,
  ModalDialog: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  Sheet: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  Stack: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  Typography: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  useBreakpoints: () => mockBreakpoints,
}));

jest.mock('@castlery/fortress/Icons', () => ({
  ArrowLeft: () => <span>left</span>,
  ArrowRight: () => <span>right</span>,
}));

jest.mock('swiper/react', () => ({
  Swiper: (props) => mockSwiper(props),
  SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  FreeMode: {},
  Mousewheel: {},
}));

jest.mock('swiper/css', () => ({}));
jest.mock('swiper/css/mousewheel', () => ({}));
jest.mock('swiper/css/navigation', () => ({}));
jest.mock('swiper/css/scrollbar', () => ({}));

jest.mock('./thumbnail-image', () => ({
  ThumbnailImage: ({ index }) => <div data-testid={`thumb-${index}`} />,
}));

jest.mock('@castlery/shared-redux-store', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@castlery/modules-tracking-services', () => ({
  EVENT_PDP_IMAGE_5S: (...args) => mockTrackImage5S(...args),
}));

jest.mock('@castlery/modules-tracking-components', () => {
  return {
    useDelayedCallback: (value: unknown, callback: (val: unknown) => void, delay = 5000, active = true) => {
      useReactEffect(() => {
        if (!active) return;
        const timer = setTimeout(() => callback(value), delay);
        return () => clearTimeout(timer);
      }, [active, callback, delay, value]);
    },
  };
});

describe('ProductEnlargedGalleryViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockBreakpoints.desktop = true;
    observerRecords.clear();
    global.IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => ({
      observe: (element: Element) => observerRecords.set(element, callback),
      unobserve: (element: Element) => observerRecords.delete(element),
      disconnect: () => observerRecords.clear(),
      root: null,
      rootMargin: '',
      thresholds: [0.6],
      takeRecords: () => [],
    })) as any;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders media items in enlarged desktop context', () => {
    const renderMediaItem = jest.fn((_media, index) => <div>{`media-${index}`}</div>);

    render(
      <ProductEnlargedGalleryViewer
        open={true}
        onClose={jest.fn()}
        galleryList={[{ type: 'image', links: { feed: 'a' } } as any, { type: 'video', path: 'b' } as any]}
        initialIndex={0}
        product={{ name: 'Test Product' } as any}
        renderMediaItem={renderMediaItem}
      />
    );

    expect(renderMediaItem).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ type: 'image' }),
      0,
      true,
      'enlarged-desktop'
    );
    expect(renderMediaItem).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ type: 'video' }),
      1,
      false,
      'enlarged-desktop'
    );
  });

  it('configures the desktop swiper as the enlarged desktop viewport', () => {
    render(
      <ProductEnlargedGalleryViewer
        open={true}
        onClose={jest.fn()}
        galleryList={[{ type: 'image', links: { feed: 'a' } } as any]}
        initialIndex={0}
        product={{ name: 'Test Product' } as any}
        renderMediaItem={jest.fn(() => (
          <div>media</div>
        ))}
      />
    );

    expect(mockSwiper.mock.calls[0][0]).toMatchObject({
      slidesPerView: 1.1,
      style: expect.objectContaining({
        height: '100%',
        aspectRatio: 1.1,
      }),
      'data-testid': 'enlarged-gallery-swiper',
    });
  });

  it('renders the desktop swiper inside the enlarged gallery stage', () => {
    render(
      <ProductEnlargedGalleryViewer
        open={true}
        onClose={jest.fn()}
        galleryList={[{ type: 'image', links: { feed: 'a' } } as any]}
        initialIndex={0}
        product={{ name: 'Test Product' } as any}
        renderMediaItem={jest.fn(() => (
          <div>media</div>
        ))}
      />
    );

    expect(screen.getByTestId('enlarged-gallery-stage')).toBeTruthy();
    expect(screen.getByTestId('enlarged-gallery-swiper')).toBeTruthy();
  });

  it('dispatches 5s tracking for the active desktop slide and resets when the slide changes', () => {
    render(
      <ProductEnlargedGalleryViewer
        open={true}
        onClose={jest.fn()}
        galleryList={[{ type: 'image', links: { feed: 'a' } } as any, { type: 'video', path: 'b' } as any]}
        initialIndex={0}
        product={{ name: 'Test Product' } as any}
        renderMediaItem={jest.fn(() => (
          <div>media</div>
        ))}
      />
    );

    act(() => {
      jest.advanceTimersByTime(4999);
    });

    expect(mockTrackImage5S).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('trigger-slide-change-1'));

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockTrackImage5S).toHaveBeenCalledWith({
      assetPosition: 2,
      assetType: 'video',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      assetPosition: 2,
      assetType: 'video',
    });
  });

  it('dispatches 5s tracking when a mobile media item stays visible for 5 seconds', () => {
    mockBreakpoints.desktop = false;

    render(
      <ProductEnlargedGalleryViewer
        open={true}
        onClose={jest.fn()}
        galleryList={[{ type: 'image', links: { feed: 'a' } } as any]}
        initialIndex={0}
        product={{ name: 'Test Product' } as any}
        renderMediaItem={jest.fn(() => (
          <div>media</div>
        ))}
      />
    );

    const trackedNode = screen.getByTestId('enlarged-media-track-0');
    const callback = observerRecords.get(trackedNode);

    expect(callback).toBeTruthy();

    act(() => {
      callback?.(
        [{ isIntersecting: true, intersectionRatio: 1, target: trackedNode } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      jest.advanceTimersByTime(5000);
    });

    expect(mockTrackImage5S).toHaveBeenCalledWith({
      assetPosition: 1,
      assetType: 'image',
    });
  });

  it('uses custom tracking payload overrides for dimension viewers', () => {
    render(
      <ProductEnlargedGalleryViewer
        open={true}
        onClose={jest.fn()}
        galleryList={[{ type: 'base', links: { feed: 'a' } } as any]}
        initialIndex={0}
        product={{ name: 'Test Product' } as any}
        renderMediaItem={jest.fn(() => (
          <div>media</div>
        ))}
        getTrackingPayload={() => ({ assetPosition: 'product dimension', assetType: 'dimension' })}
      />
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockTrackImage5S).toHaveBeenCalledWith({
      assetPosition: 'product dimension',
      assetType: 'dimension',
    });
  });
});
