import { render, screen } from '@testing-library/react';
import { ThumbnailImage } from './thumbnail-image';

const omitLayoutProps = ({ alignItems, justifyContent, sx, ...props }) => props;

const mockBreakpoints = {
  desktop: true,
  tablet: false,
  mobile: false,
};

jest.mock('@castlery/fortress', () => ({
  Box: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  Stack: ({ children, ...props }) => <div {...omitLayoutProps(props)}>{children}</div>,
  useBreakpoints: () => mockBreakpoints,
}));

jest.mock('@castlery/fortress/Icons', () => ({
  PlayWhite: () => <div>PlayWhite</div>,
  Dimension: () => <div>Dimension</div>,
  ThreeSixty: () => <div>ThreeSixty</div>,
}));

jest.mock('@castlery/shared-components', () => ({
  FortressImage: ({ alt, src, objectFit, ...props }) => (
    <img alt={alt} src={src} data-object-fit={objectFit ?? ''} {...props} />
  ),
}));

jest.mock('@castlery/utils', () => ({
  generateVideoThumbnail: () => 'https://cdn.example.com/video-thumbnail.jpg',
}));

jest.mock('./base-overlay-image', () => ({
  BaseOverlayImage: ({ alt, src, objectFit }) => <img alt={alt} src={src} data-object-fit={objectFit ?? ''} />,
}));

describe('ThumbnailImage', () => {
  beforeEach(() => {
    mockBreakpoints.desktop = true;
    mockBreakpoints.tablet = false;
    mockBreakpoints.mobile = false;
  });

  it('uses cover thumbnails for desktop preview videos', () => {
    render(
      <ThumbnailImage
        media={{ type: 'video', path: 'https://cdn.example.com/video.mp4' } as any}
        index={0}
        product={{ name: 'Test Sofa' } as any}
        isActive={false}
        renderContext="pdp-desktop-preview"
      />
    );

    expect(screen.getByAltText('Test Sofa 0').getAttribute('data-object-fit')).toBe('cover');
  });
});
