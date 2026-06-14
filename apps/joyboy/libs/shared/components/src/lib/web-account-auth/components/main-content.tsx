'use client';

import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { LoginContent } from './login-content';
import { SignupContent } from './signup-content';

interface MainContentProps {
  displayLogin: boolean;
  onSignUp?: () => void;
  onSignIn?: () => void;
  onForgotPassword?: () => void;
  onSuccess?: () => void | Promise<void>;
}

export const MainContent = (props: MainContentProps) => {
  const { displayLogin, onSignUp, onSignIn, onForgotPassword, onSuccess } = props;
  const { mobile } = useBreakpoints();
  return (
    <Stack justifyContent="center" alignItems="stretch">
      <Typography level="h2" sx={{ textAlign: 'center' }}>
        Welcome
      </Typography>
      <Typography
        level="body1"
        sx={{
          textAlign: 'center',
          mt: mobile ? 2 : 4,
        }}
      >
        Log in or sign up for an account. <br />
        Furniture shopping is about to get exciting, and we wouldn’t want you to miss out on anything.
      </Typography>
      {displayLogin ? (
        <LoginContent onSignUp={onSignUp} onForgotPassword={onForgotPassword} onSuccess={onSuccess} />
      ) : (
        <SignupContent onSignIn={onSignIn} onSuccess={onSuccess} />
      )}
    </Stack>
  );
};
