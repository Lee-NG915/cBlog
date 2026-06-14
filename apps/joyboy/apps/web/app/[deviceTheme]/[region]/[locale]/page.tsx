import { redirect } from 'next/navigation';
import NotFound from '../../../not-found';
import { isSupportedRegion } from '../../../../navigation';

export default async function LocaleRootPage({ params: { region } }: { params: { locale: string; region: string } }) {
  const validRegion = isSupportedRegion(region);
  if (!validRegion) {
    return <NotFound />;
  }

  // 主页面应该重定向到 /home，这样中间件 homeMiddleware 就会处理
  // 或者直接显示首页内容，但这里我们重定向到 /home 让中间件处理
  redirect('/home');
}
