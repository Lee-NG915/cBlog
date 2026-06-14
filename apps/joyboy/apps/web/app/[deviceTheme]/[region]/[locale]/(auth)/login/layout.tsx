import { LoginLayoutClient } from './layout.client';

interface LoginLayoutProps {
  children: React.ReactNode;
  params: {
    region: string;
    locale: string;
    slug: string;
  };
}

export default function LoginLayout({ children, params }: LoginLayoutProps) {
  return (
    <>
      <LoginLayoutClient />
      {children}
    </>
  );
}
