import { forwardRef } from 'react';
import { render, screen } from '@testing-library/react';

import { MediaItem } from './media-item';

const omitLayoutProps = ({
  alignItems,
  direction,
  justifyContent,
  level,
  orientation,
  overlay,
  checkedIcon,
  slotProps,
  spacing,
  sx,
  uncheckedIcon,
  variant,
  ...props
}) => props;

const mockBreakpoints = {
  desktop: true,
  mobile: false,
};

const mockFortressVideo = jest.fn((props) => (
  <div
    data-testid="fortress-video"
    data-controls={String(props.controls ?? true)}
    data-src={props.src}
    data-object-fit={props.containerConfig?.objectFit ?? ''}
  />
));

jest.mock('@castlery/fortress', () => ({
  Box: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  RadioGroup: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  RadioIcon: ({ slotProps, ...props }) => <input type="radio" {...slotProps?.input} {...omitLayoutProps(props)} />,
  Stack: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  Tag: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  Typography: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
}));

jest.mock('@castlery/fortress/hooks', () => ({
  useBreakpoints: () => mockBreakpoints,
}));

jest.mock('@castlery/fortress/Icons', () => ({
  Dimension: () => <div>Dimension</div>,
}));

jest.mock('@castlery/shared-components', () => ({
  FortressImage: ({ alt, src, ...props }) => <img alt={alt} src={src} {...props} />,
  FortressVideo: forwardRef((props: any, _ref) => mockFortressVideo(props)),
}));

jest.mock('./base-overlay-image', () => ({
  BaseOverlayImage: ({ alt, src }) => <img alt={alt} src={src} />,
}));

jest.mock('./three-sixty-view-image', () => () => <div data-testid="three-sixty-view-image" />);

jest.mock('@castlery/shared-redux-store', () => ({
  useAppDispatch: () => jest.fn(),
}));

jest.mock('@castlery/modules-tracking-services', () => ({
  EVENT_PDP_DETAILS: jest.fn(),
}));

jest.mock('@castlery/modules-product-services', () => ({
  videosOptionTypes: ['video', 'master_video', 'short_video'],
}));

describe('MediaItem', () => {
  const product = {
    name: 'Test Sofa',
    taxons: [],
    bundle_options: [],
  } as any;

  const variant = {
    badges: [],
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBreakpoints.desktop = true;
    mockBreakpoints.mobile = false;
  });

  it('renders master_video in the first slot as video instead of the legacy image branch', () => {
    render(
      <MediaItem
        media={{ type: 'master_video', path: 'https://cdn.example.com/master.mp4' } as any}
        product={product}
        variant={variant}
        index={0}
        isCurrent={true}
        renderContext="pdp-desktop-preview"
      />
    );

    expect(screen.getByTestId('fortress-video')).toBeTruthy();
    expect(mockFortressVideo).toHaveBeenCalled();
  });

  it('disables controls for desktop preview video tiles', () => {
    render(
      <MediaItem
        media={{ type: 'video', path: 'https://cdn.example.com/preview.mp4' } as any}
        product={product}
        variant={variant}
        index={1}
        isCurrent={true}
        renderContext="pdp-desktop-preview"
      />
    );

    expect(screen.getByTestId('fortress-video').getAttribute('data-controls')).toBe('false');
  });

  it('uses cover video cropping for desktop preview video tiles', () => {
    render(
      <MediaItem
        media={{ type: 'video', path: 'https://cdn.example.com/preview.mp4' } as any}
        product={product}
        variant={variant}
        index={1}
        isCurrent={true}
        renderContext="pdp-desktop-preview"
      />
    );

    expect(screen.getByTestId('fortress-video').getAttribute('data-object-fit')).toBe('cover');
  });

  it('keeps controls enabled in enlarged desktop viewer', () => {
    render(
      <MediaItem
        media={{ type: 'video', path: 'https://cdn.example.com/enlarged.mp4' } as any}
        product={product}
        variant={variant}
        index={1}
        isCurrent={true}
        renderContext="enlarged-desktop"
      />
    );

    expect(screen.getByTestId('fortress-video').getAttribute('data-controls')).toBe('true');
  });

  it('hides the dimension toggle in desktop preview context', () => {
    render(
      <MediaItem
        media={{ type: 'base', links: { feed: 'https://cdn.example.com/base.jpg' } } as any}
        product={{ ...product, dimension_image: { links: { feed: 'https://cdn.example.com/dim.jpg' } } } as any}
        variant={variant}
        index={0}
        isCurrent={true}
        renderContext="pdp-desktop-preview"
      />
    );

    expect(screen.queryByLabelText('Toggle product dimensions')).toBeNull();
  });

  it('hides badges but keeps the dimension toggle in enlarged mobile context', () => {
    mockBreakpoints.desktop = false;
    mockBreakpoints.mobile = true;

    render(
      <MediaItem
        media={{ type: 'base', links: { feed: 'https://cdn.example.com/base.jpg' } } as any}
        product={{ ...product, dimension_image: { links: { feed: 'https://cdn.example.com/dim.jpg' } } } as any}
        variant={{ badges: ['Sale'] } as any}
        index={0}
        isCurrent={true}
        renderContext="enlarged-mobile"
      />
    );

    expect(screen.queryByText('Sale')).toBeNull();
    expect(screen.getByLabelText('Toggle product dimensions')).toBeTruthy();
  });
});
