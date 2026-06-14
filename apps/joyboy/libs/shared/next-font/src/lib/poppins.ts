import { Poppins } from 'next/font/google';

export const poppins = Poppins({
  weight: ['300', '400', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  subsets: ['latin'],
});
