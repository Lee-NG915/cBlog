import { api } from '@castlery/shared-redux-services';
import { Tokens } from '../entity/user.entity';
import { encryptPassword } from '@castlery/utils';

/**
 * TODO 个人觉得 这几个API的安全性特别差，
 * 建议可以在前端添加 api 并利用 第三方如 Clerk或者NextAuth重新封装
 *  https://nextjs.org/docs/app/building-your-application/authentication#examples
 */
export const oauthApi = api.injectEndpoints({
  endpoints: (builder) => {
    const login = builder.mutation<Tokens, { username: string; password: string; version?: number }>({
      query: ({ username, password, version }) => ({
        url: `oauth/token`,
        method: 'POST',
        body: {
          username,
          password,
          grant_type: 'password',
          version,
        },
      }),
      extraOptions: {
        maxRetries: 0 as any,
      },
    });
    return {
      login,
      getOauthToken: builder.mutation<Tokens, { refresh_token: string }>({
        query: ({ refresh_token }) => ({
          url: `oauth/token`,
          method: 'POST',
          body: {
            refresh_token,
            grant_type: 'refresh_token',
          },
        }),
      }),
      googleLogin: builder.mutation<Tokens, { id_token: string }>({
        query: ({ id_token }) => ({
          url: `social_logins/google`,
          method: 'POST',
          body: { id_token },
        }),
        extraOptions: {
          maxRetries: 0 as any,
        },
      }),
      appleLogin: builder.mutation<
        Tokens,
        {
          auth_code: string;
          id_token: string;
          redirect_uri: string;
          firstname?: string;
          lastname?: string;
        }
      >({
        query: ({ auth_code, id_token, redirect_uri, firstname, lastname }) => ({
          url: `social_logins/apple`,
          method: 'POST',
          body: { auth_code, id_token, redirect_uri, firstname, lastname },
        }),
        extraOptions: {
          maxRetries: 0 as any,
        },
      }),
      facebookLogin: builder.mutation<Tokens, { signedRequest: string }>({
        query: ({ signedRequest }) => ({
          url: `users/auth/facebook/callback?fb_sign_request=${signedRequest}`,
          method: 'POST',
        }),
        extraOptions: {
          maxRetries: 0 as any,
        },
      }),
    };
  },
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useLoginMutation,
  useGetOauthTokenMutation,
  useGoogleLoginMutation,
  useAppleLoginMutation,
  useFacebookLoginMutation,
} = oauthApi;
export const { login, getOauthToken, googleLogin, appleLogin, facebookLogin } = oauthApi.endpoints;

export default oauthApi;
