import localFont from 'next/font/local';
export const aime = localFont({
  src: [
    {
      path: '../fonts/aime-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/aime-italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/aime-bold.woff2',
      weight: '600 700',
      style: 'normal',
    },
    {
      path: '../fonts/aime-bold-italic.woff2',
      weight: '600 700',
      style: 'italic',
    },
    // {
    //   path: '../fonts/aime-bold.woff2',
    //   weight: '700',
    //   style: 'normal',
    // },
    // {
    //   path: '../fonts/aime-bold-italic.woff2',
    //   weight: '700',
    //   style: 'italic',
    // },
  ],
  display: 'swap',
  variable: '--font-aime',
});
