import { ForgotPasswordLayoutClient } from './layout.client';

interface ForgotPasswordLayoutProps {
  children: React.ReactNode;
  params: {
    region: string;
    locale: string;
    slug: string;
  };
}

export default function ForgotPasswordLayout({ children, params }: ForgotPasswordLayoutProps) {
  return (
    <>
      <ForgotPasswordLayoutClient />
      {children}
    </>
  );
}
