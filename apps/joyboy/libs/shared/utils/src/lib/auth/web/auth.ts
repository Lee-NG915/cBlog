// import NextAuth from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
// import type { Provider } from 'next-auth/providers';
// import { EcEnv } from '@castlery/config';
// import { googleHandler, loginHandler, refreshAccessToken } from '../auth.actions';
// import { makePersistenceHandles, refreshToken } from '@castlery/shared-persistence-kit';
// import CustomGoogle from '../providers/customGoogle';
// import CustomFacebook from '../providers/customFacebook';
// import CustomApple from '../providers/customApple';
// declare module 'next-auth' {
//   interface Session {
//     access_token: string;
//     created_at: number;
//     expires_in: number;
//     is_new_user: boolean;
//     refresh_token: string;
//     region?: string;
//     error?: string;
//   }
//   interface AdapterUser {
//     id?: string;
//     access_token?: string;
//     created_at?: number;
//     expires_in?: number;
//     refresh_token?: string;
//     token_type?: string;
//   }
//   interface User {
//     id?: string;
//     access_token?: string;
//     created_at?: number;
//     expires_in?: number;
//     refresh_token?: string;
//     token_type?: string;
//     region?: string;
//   }
// }

// const providers: Provider[] = [
//   CustomGoogle(),
//   CustomFacebook(),
//   CustomApple(),
//   Credentials({
//     name: 'Email and Password',
//     credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
//     async authorize(credentials: Partial<Record<'email' | 'password', unknown>>) {
//       let result = null;
//       if (credentials?.email && credentials?.password) {
//         result = await loginHandler(credentials.email as string, credentials.password as string);
//       }
//       return result;
//     },
//   }),
// ];

// export const webProviderMap = providers.map((provider) => {
//   if (typeof provider === 'function') {
//     const providerData = provider();
//     return { id: providerData.id, name: providerData.name };
//   } else {
//     return { id: provider.id, name: provider.name };
//   }
// });

// export const {
//   handlers: webHandlers,
//   signIn: webSignIn,
//   signOut: webSignOut,
//   auth: webAuth,
//   unstable_update: updateWebToken,
// } = NextAuth({
//   providers,
//   pages: {
//     signIn: '/login',
//   },

//   session: {
//     strategy: 'jwt',
//   },
//   jwt: {
//     encode: async ({ secret, token }) => {
//       if (token?.['access_token']) {
//         return token['access_token'] as string;
//       }
//       return '';
//     },
//     decode: async ({ secret, token }) => {
//       return {
//         access_token: token,
//       };
//     },
//   },
//   cookies: {
//     sessionToken: {
//       name: 'access_token',
//       options: {
//         sameSite: 'lax',
//         httpOnly: false,
//         path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`,
//         secure: true,
//         maxAge: 60 * 60 * 24 * 365,
//       },
//     },
//   },
//   callbacks: {
//     jwt: async (props) => {
//       const { token, account, trigger, user } = props;
//       if (account && user) {
//         // if (account?.provider === 'google' && account?.id_token) {
//         //   token['id_token'] = account.id_token;
//         //   token['id'] = user.id;
//         //   const result = await googleHandler(token['id_token'] as string, user?.region || 'sg');
//         //   if (result) {
//         //     token['access_token'] = result.access_token;
//         //     token['created_at'] = result.created_at;
//         //     token['expires_in'] = result.expires_in;
//         //     token['is_new_user'] = result.is_new_user;
//         //     token['refresh_token'] = result.refresh_token;
//         //     token['region'] = user?.region || 'sg';
//         //   }
//         // }
//         if (user) {
//           token['id'] = user.id;
//           token['access_token'] = user.access_token;
//           token['created_at'] = user.created_at;
//           token['expires_in'] = user.expires_in;
//           token['refresh_token'] = user.refresh_token;
//           token['token_type'] = user.token_type;
//           // token['region'] = user?.region || 'sg';

//           // refresh_token 单独存储到 cookie
//           if (user.refresh_token) {
//             try {
//               const { cookies } = await import('next/headers');
//               cookies().set(refreshToken, user.refresh_token, {
//                 sameSite: 'lax',
//                 httpOnly: false,
//                 path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`,
//                 secure: true,
//                 maxAge: 60 * 60 * 24 * 365,
//               });
//             } catch (error) {
//               console.debug('Cookie setting deferred to middleware/API route');
//             }
//           }
//         }
//       } else {
//         // if (trigger === 'update') {
//         //   // RTK Query 已经刷新了 token，这里只需要更新 refresh_token cookie
//         //   if (token['refresh_token']) {
//         //     try {
//         //       const { cookies } = await import('next/headers');
//         //       cookies().set(refreshToken, token['refresh_token'] as string, {
//         //         httpOnly: true,
//         //         sameSite: 'lax',
//         //         path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`,
//         //         secure: process.env.NODE_ENV === 'production',
//         //         maxAge: 60 * 60 * 24 * 365,
//         //       });
//         //     } catch (error) {
//         //       console.debug('Refresh token cookie update deferred');
//         //     }
//         //   }
//         // }
//         // // 其他情况：直接返回当前 token，不做任何过期检查或自动刷新
//         // // 让 RTK Query 在实际 API 调用时处理 token 过期问题
//       }
//       return token;
//     },

//     session: async (props) => {
//       const { token, session } = props;
//       if (token.sub) {
//         session.user.id = token.sub as string;
//       }
//       session.access_token = token['access_token'] as string;
//       session.created_at = token['created_at'] as number;
//       session.expires_in = token['expires_in'] as number;
//       session.is_new_user = token['is_new_user'] as boolean;
//       session.refresh_token = token['refresh_token'] as string;
//       // session.region = token['region'] as string;
//       session.error = token['error'] as string;
//       return session;
//     },
//   },
// });
