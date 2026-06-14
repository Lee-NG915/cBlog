import React from 'react';
import { render, screen } from '@testing-library/react';
import ImageGallery from './image-gallery';

// ── FortressImage mock: expose objectFit as data attribute ──────────────────
jest.mock('@castlery/shared-components', () => ({
  FortressImage: ({ objectFit, src, alt }: { objectFit?: string; src?: string; alt?: string }) => (
    <img data-testid="fortress-image" data-object-fit={objectFit} src={src} alt={alt} />
  ),
}));

// ── @castlery/fortress ──────────────────────────────────────────────────────
jest.mock('@castlery/fortress', () => ({
  Box: ({ children, sx, ...rest }: any) => <div {...rest}>{children}</div>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  Typography: ({ children }: any) => <span>{children}</span>,
  AspectRatio: ({ children }: any) => <div>{children}</div>,
  useBreakpoints: () => ({ desktop: false }),
}));

// ── @castlery/fortress/Icons ─────────────────────────────────────────────────
jest.mock('@castlery/fortress/Icons', () => ({
  PlayOutline: () => <svg />,
  Play: () => <svg />,
  Close: () => <svg />,
}));

// ── react-slick ──────────────────────────────────────────────────────────────
jest.mock('react-slick', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="slider">{children}</div>,
}));

// ── next/image ───────────────────────────────────────────────────────────────
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

// ── Internal hooks ────────────────────────────────────────────────────────────
jest.mock('./hooks/use-slick', () => ({
  __esModule: true,
  default: () => ({ settings: {}, currentIndex: 0 }),
}));

jest.mock('./hooks/use-auto-hover', () => ({
  __esModule: true,
  default: () => ({ isEnterGallery: false }),
}));

jest.mock('./hooks/use-slick-auto-scroll-dot', () => ({
  useSlickAutoScrollDot: () => undefined,
}));

// ── Internal components ───────────────────────────────────────────────────────
jest.mock('./components/arrow', () => ({
  PrevArrow: () => <button>prev</button>,
  NextArrow: () => <button>next</button>,
}));

jest.mock('./components/base-image', () => ({
  __esModule: true,
  default: ({ mainSrc, mainAlt }: any) => <img src={mainSrc} alt={mainAlt} />,
}));

// ── @castlery/modules-product-domain ─────────────────────────────────────────
jest.mock('@castlery/modules-product-domain', () => ({}));

// ── @castlery/modules-product-services ───────────────────────────────────────
jest.mock('@castlery/modules-product-services', () => ({
  mergeAndSortArrays: (images: any[]) => images,
}));

// ── Shared test data ──────────────────────────────────────────────────────────
const mockProduct = { name: 'Test Product' };

const makeImage = (type: string) => ({
  type,
  links: { large: `https://example.com/${type}.jpg` },
  thumbnail: '',
  overlay: [],
});

// We always include a 'base' image at index 0 (no masterVideo) so the
// gallery renders the multi-image Slider path, and the lifestyle/base_old
// image appears at index 1 where FortressImage is rendered.
const baseImage = makeImage('base');

describe('ImageGallery — objectFit for lifestyle images', () => {
  it('renders FortressImage with objectFit="cover" for lifestyle type', () => {
    render(<ImageGallery images={[baseImage, makeImage('lifestyle')]} assets={[]} product={mockProduct as any} />);
    const image = screen.getByTestId('fortress-image');
    expect(image.getAttribute('data-object-fit')).toBe('cover');
  });

  it('renders FortressImage with objectFit="cover" for lifestyle_other type', () => {
    render(
      <ImageGallery images={[baseImage, makeImage('lifestyle_other')]} assets={[]} product={mockProduct as any} />
    );
    const image = screen.getByTestId('fortress-image');
    expect(image.getAttribute('data-object-fit')).toBe('cover');
  });

  it('does not render FortressImage with objectFit="cover" for base_old type', () => {
    render(<ImageGallery images={[baseImage, makeImage('base_old')]} assets={[]} product={mockProduct as any} />);
    const image = screen.getByTestId('fortress-image');
    expect(image.getAttribute('data-object-fit')).toBeNull();
  });
});
