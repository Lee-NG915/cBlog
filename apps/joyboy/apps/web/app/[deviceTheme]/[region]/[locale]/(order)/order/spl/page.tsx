import { SplTransitPageClient } from './page.client';

type SplPageSearchParams = {
  bizToken?: string;
  orderId?: string;
  _kx?: string;
};

export default function SplTransitPage({ searchParams }: { searchParams: SplPageSearchParams }) {
  return <SplTransitPageClient bizToken={searchParams.bizToken ?? ''} orderId={searchParams.orderId ?? ''} />;
}
