import { ResetPasswordLayoutClient } from './layout.client';

interface ResetPasswordLayoutProps {
  children: React.ReactNode;
  params: {
    region: string;
    locale: string;
    slug: string;
  };
}

export default function ResetPasswordLayout({ children, params }: ResetPasswordLayoutProps) {
  return (
    <>
      <ResetPasswordLayoutClient />
      {children}
    </>
  );
}
