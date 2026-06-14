// import NextAuth from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
// import type { Provider } from 'next-auth/providers';
// import { defaultLocale } from '@castlery/config';
// import { loginHandler, refreshAccessToken } from '../auth.actions';

// // 暂时没有用到该文件

// declare module 'next-auth' {
//   interface Session {
//     access_token: string;
//     created_at: number;
//     expires_in: number;
//     is_new_user: boolean;
//     refresh_token: string;
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
//   }
// }

// const providers: Provider[] = [
//   Credentials({
//     credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
//     async authorize(credentials) {
//       const result = await loginHandler(credentials.email as string, credentials.password as string, 'sg');
//       return result || null;
//     },
//   }),
// ];

// export const posProviderMap = providers.map((provider) => {
//   if (typeof provider === 'function') {
//     const providerData = provider();
//     return { id: providerData.id, name: providerData.name };
//   } else {
//     return { id: provider.id, name: provider.name };
//   }
// });

// export const {
//   handlers: posHandlers,
//   signIn: posSignIn,
//   signOut: posSignOut,
//   auth: posAuth,
//   unstable_update: updatePosToken,
// } = NextAuth({
//   providers,
//   pages: {
//     signIn: `/${defaultLocale}/login`, // 自定义配置页面，配置后若访问默认登陆路径 /api/auth/signin 会重定向到此页面
//   },
//   session: {
//     strategy: 'jwt',
//   },
//   callbacks: {
//     jwt: async (props) => {
//       const { token, user, account, trigger } = props;
//       if (account) {
//         if (account?.provider === 'credentials' && user) {
//           token['id'] = user.id;
//           token['access_token'] = user.access_token;
//           token['created_at'] = user.created_at;
//           token['expires_in'] = user.expires_in;
//           token['refresh_token'] = user.refresh_token;
//           token['token_type'] = user.token_type;
//         }
//       } else {
//         const triggerFlag = trigger === 'update';
//         let expireFlag = false;
//         if (token['created_at'] && token['expires_in']) {
//           const now = Math.floor(Date.now() / 1000);
//           const expires_at = Number(token['created_at']) + Number(token['expires_in']);
//           if (now >= expires_at) {
//             expireFlag = true;
//           }
//         }
//         if (triggerFlag || expireFlag) {
//           try {
//             const refreshResult = await refreshAccessToken(token);
//             if (refreshResult) {
//               token['access_token'] = refreshResult.access_token;
//               token['refresh_token'] = refreshResult.refresh_token;
//               token['created_at'] = refreshResult.created_at;
//               token['expires_in'] = refreshResult.expires_in;
//             }
//           } catch (error) {
//             console.error('Error refreshing access token', error);
//             return { ...token, error };
//           }
//         }
//       }
//       return token;
//     },

//     session: async ({ session, token }) => {
//       if (token.sub) {
//         session.user.id = token.sub as string;
//       }
//       session.access_token = token['access_token'] as string;
//       session.created_at = token['created_at'] as number;
//       session.expires_in = token['expires_in'] as number;
//       session.is_new_user = token['is_new_user'] as boolean;
//       session.refresh_token = token['refresh_token'] as string;
//       session.error = token['error'] as string;
//       return session;
//     },
//   },
// });
