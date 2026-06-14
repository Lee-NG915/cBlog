import { SignupLayoutClient } from './layout.client';

interface SignupLayoutProps {
  children: React.ReactNode;
  params: {
    region: string;
    locale: string;
    slug: string;
  };
}

export default function SignupLayout({ children, params }: SignupLayoutProps) {
  return (
    <>
      <SignupLayoutClient />
      {children}
    </>
  );
}
