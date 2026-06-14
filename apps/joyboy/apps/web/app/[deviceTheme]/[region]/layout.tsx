import { ThemeProvider } from '@castlery/shared-components';
import { BreakpointProvider } from '@castlery/fortress';
import { RegionLayoutClient } from './layout.client';

type RootLayoutProperties = {
  children: React.ReactNode;
  params: { locale: string; region: string; deviceTheme: string };
};

export default async function RegionLayout({ children, params: { deviceTheme } }: RootLayoutProperties) {
  const [device = '', theme = ''] = deviceTheme?.split('-') ?? [];

  return (
    <>
      <ThemeProvider
        appContext={{
          device,
          theme,
        }}
      >
        <BreakpointProvider>
          <RegionLayoutClient>{children}</RegionLayoutClient>
        </BreakpointProvider>
      </ThemeProvider>
    </>
  );
}
