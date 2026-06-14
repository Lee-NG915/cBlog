import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { cookies } from 'next/headers';
import { CustomerServiceBox } from '@castlery/shared-components';
import { MarketCheck } from '../market-check';

export async function WebMainLayout({
  children,
  needHideDYBanner = false,
}: {
  children?: React.ReactNode;
  needHideDYBanner?: boolean;
}) {
  const cookieStore = await cookies();
  const noticeSwitch = cookieStore.get('notice_switch')?.value;
  return (
    <>
      <CustomerServiceBox />
      <Header noticeSwitch={noticeSwitch} needHideDYBanner={needHideDYBanner} />
      {children}
      <Footer />
      <MarketCheck />
    </>
  );
}
