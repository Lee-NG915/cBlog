// import { useRouter } from 'next/navigation';
interface PDPLayoutProps {
  children: React.ReactNode;
  params: {
    region: string;
    locale: string;
    slug: string;
  };
}

export default function PDPLayout({ children, params }: PDPLayoutProps) {
  //   const { query } = useRouter();
  // console.log('-------params', params); // { region: 'us', locale: 'en', slug: 'test' }

  return <>{children}</>;
}
