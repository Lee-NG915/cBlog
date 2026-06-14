import localFont from 'next/font/local';
export const sanomatSans = localFont({
  src: [
    {
      path: '../fonts/sanomatSans-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/sanomatSans-bold.woff2',
      weight: '600 700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-sanoma-sans',
});
