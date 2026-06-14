import { type MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    // name: siteConfig.name,
    // short_name: siteConfig.shortName,
    // description: siteConfig.description,
    // start_url: '/',
    // display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#c026d3',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16',
        type: 'image/x-icon',
      },
    ],
  };
}
