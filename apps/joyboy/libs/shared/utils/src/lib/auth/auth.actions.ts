'use server';
import { post } from '../fetch.actions';
import { EcEnv } from '@castlery/config';
// import { updateWebToken, webSignIn, webSignOut } from './web/auth';
import { encryptPassword } from '../auth.util';

export const googleHandler = async (id_token: string) => {
  const result = await post(`${EcEnv.NEXT_PUBLIC_API_HOST}/social_logins/google`, {
    body: {
      id_token,
    },
    cacheOption: 'no-store',
  });
  return result;
};

export const facebookHandler = async (signedRequest: string) => {
  const result = await post(
    `${EcEnv.NEXT_PUBLIC_API_HOST}/users/auth/facebook/callback?fb_sign_request=${signedRequest}`,
    {
      cacheOption: 'no-store',
    }
  );
  return result;
};

export const appleHandler = async ({
  auth_code,
  id_token,
  redirect_uri,
  firstname,
  lastname,
}: {
  auth_code: string;
  id_token: string;
  redirect_uri: string;
  firstname?: string;
  lastname?: string;
}) => {
  const result = await post(`${EcEnv.NEXT_PUBLIC_API_HOST}/social_logins/apple`, {
    body: {
      auth_code,
      id_token,
      redirect_uri,
      firstname,
      lastname,
    },
    cacheOption: 'no-store',
  });
  return result;
};

export const loginHandler = async (email: string, password: string) => {
  const result = await post(`${EcEnv.NEXT_PUBLIC_API_HOST}/oauth/token`, {
    body: {
      grant_type: 'password',
      username: email,
      version: 1,
      password: encryptPassword(password),
    },
    cacheOption: 'no-store',
  });
  return result;
};

// export const refreshAccessToken = async (token: any) => {
//   const refreshToken = token.refresh_token;
//   if (!refreshToken) {
//     throw new Error('Missing refresh token');
//   }
//   try {
//     const result = await post(`${EcEnv.NEXT_PUBLIC_API_HOST}/oauth/token`, {
//       body: {
//         grant_type: 'refresh_token',
//         refresh_token: refreshToken,
//       },
//       cacheOption: 'no-store',
//     });
//     return result;
//   } catch (error) {
//     throw new Error(error as string);
//   }
// };

// export const webServerSideRefreshToken = async () => {
//   return await updateWebToken({
//     user: undefined,
//   });
// };

// export const webAuthSignOut = async (...params: any) => {
//   try {
//     await webSignOut(...params);
//   } catch (error) {
//     // Signin can fail for a number of reasons, such as the user
//     // not existing, or the user not having the correct role.
//     // In some cases, you may want to redirect to a custom error
//     if (error instanceof AuthError) {
//       return redirect(`/error?error=${error.type}`);
//     }
//     // Otherwise if a redirects happens NextJS can handle it
//     // so you can just re-thrown the error and let NextJS handle it.
//     // Docs:s
//     // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
//     throw error;
//   }
// };

// export const webAuthSignIn = async (...params: any) => {
//   try {
//     await webSignIn(...params);
//   } catch (error) {
//     // Signin can fail for a number of reasons, such as the user
//     // not existing, or the user not having the correct role.
//     // In some cases, you may want to redirect to a custom error
//     if (error instanceof AuthError) {
//       return redirect(`/error?error=${error.type}`);
//     }

//     // Otherwise if a redirects happens NextJS can handle it
//     // so you can just re-thrown the error and let NextJS handle it.
//     // Docs:s
//     // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
//     throw error;
//   }
// };

// export const posServerSideRefreshToken = async () => {
//   return await updatePosToken({
//     user: undefined,
//   });
// };
