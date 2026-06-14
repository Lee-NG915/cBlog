import localFont from 'next/font/local';
export const minervaModern = localFont({
  src: [
    {
      path: '../fonts/minervaModern-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/minervaModern-bold.woff2',
      weight: '600 700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-minerva-modern',
});
