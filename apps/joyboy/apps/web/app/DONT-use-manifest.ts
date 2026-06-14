import { EcEnv } from '@castlery/config';
import { type MetadataRoute } from 'next';
import { headers } from 'next/headers';
/**
 * TODO
 * 现在不要使用  manifest , 如果使用了 就会导致 页面会请求到 www.castlery.com/manifest
 * 如果是这么命中的化 就会直接在Route53 那里命中 *  ,那里的 default 还是 Onepice
 * 要等到 Joyboy 实现 国家选择后 再去处理 , 而且正常来说 我们确实要实现 和Onepice一样 静态文件都要添加一个前缀
 * @returns
 */
export default function manifest(): MetadataRoute.Manifest {
  const headersList = headers();
  const host = headersList.get('host') || 'www.castlery.com';
  if (EcEnv.NODE_ENV !== 'production' || host.includes('new')) {
    return {
      name: 'Castlery',
      display: 'standalone',
    };
  }

  // 下面这里是为了适配Onepice, 这样就可以确保 www.castlery.com 的 manifest在Joyboy 和 OP都是一致的, 然后icons的静态文件都是请求到OP里的static目录
  return {
    name: 'Castlery',
    icons: [
      { src: '/static/favicon/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/static/favicon/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    display: 'standalone',
  };
}
