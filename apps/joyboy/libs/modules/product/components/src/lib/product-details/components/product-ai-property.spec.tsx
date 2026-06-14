import { render, screen } from '@testing-library/react';
import { ProductAIProperty } from './product-ai-property';

jest.mock('@castlery/fortress', () => ({
  Box: ({ children }: any) => <div>{children}</div>,
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  Stack: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@castlery/shared-components', () => ({
  FortressVideo: ({ src }: { src: string }) => <div data-testid="fortress-video">{src}</div>,
}));

describe('ProductAIProperty', () => {
  it('renders the hardcoded assembly copy inline with videos and docs', () => {
    render(
      <ProductAIProperty
        aiData={{
          aiVideos: [
            {
              id: 1,
              filetype: 'video',
              display_filename: 'assembly-video',
              file_link: 'https://example.com/video.mp4',
              created_at: '',
              filename: 'assembly-video',
            },
          ],
          aiDocs: [
            {
              id: 2,
              filetype: 'doc',
              display_filename: 'assembly-guide',
              file_link: 'https://example.com/guide.pdf',
              created_at: '',
              filename: 'assembly-guide',
            },
          ],
        }}
      />
    );

    expect(screen.getByText('Assembly guides and videos are provided below to help with setup.')).toBeTruthy();
    expect(screen.getByText('Assembly videos')).toBeTruthy();
    expect(screen.getByTestId('fortress-video').textContent).toBe('https://example.com/video.mp4');
    expect(screen.getByText('assembly-guide').getAttribute('href')).toBe('https://example.com/guide.pdf');
  });

  it('renders only the hardcoded copy when ai data is absent', () => {
    render(<ProductAIProperty />);

    expect(screen.getByText('Assembly guides and videos are provided below to help with setup.')).toBeTruthy();
    expect(screen.queryByTestId('fortress-video')).toBeNull();
    expect(screen.queryByText('View')).toBeNull();
  });
});
