import { FrameContext, FrameContextType } from 'containers/Frame/FrameContext';
import React, { useContext, useState, memo } from 'react';
import { Theme, Box, Typography, Button } from '@castlery/fortress';
import { useDevice } from 'utils/hooks';
import ApiClient from 'helpers/ApiClient';
import { Close } from '@castlery/fortress/Icons';
import { ButtonLink } from './ButtonLink';

interface ResetPwdLinkProps {
  email: string;
  close: () => void;
}
const ResetModal: React.FC<ResetPwdLinkProps> = ({ email, close = () => {} }) => {
  const [processing, setProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [hasSent, setHasSent] = useState<boolean>(false);
  const tipMsg = 'A link to reset your password has been sent to ';
  const send = React.useCallback(async () => {
    const client = new ApiClient();
    const data = { email, from_email: false };
    setProcessing(true);
    try {
      await client.post('/users/recover_password', { data });
      setHasSent(true);
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
      setErrorMsg('Oops, something went wrong. Please try again later.');
    }
  }, [email]);
  return (
    <Box
      sx={{
        width: '100%',
        border: '1px solid var(--fortress-palette-brand-wheat-500)',
        paddingTop: (theme) => theme.spacing(3),
        paddingBottom: hasSent ? (theme) => theme.spacing(3) : 0,
      }}
    >
      <Box sx={{ position: 'absolute', right: '28px', top: '28px' }} onClick={close}>
        <Close
          role="button"
          sx={{
            width: 24,
            height: 24,
            '&:hover': {
              color: (theme) => theme.palette.primary[500],
            },
          }}
        />
      </Box>
      {!hasSent ? (
        <>
          <Typography level="h1" sx={{ marginBottom: (theme) => theme.spacing(2) }}>
            Reset Password
          </Typography>
          {errorMsg && (
            <Typography
              sx={{ marginTop: (theme) => theme.spacing(-1), color: 'var(--fortress-palette-brand-upsdellRed-200)' }}
            >
              {errorMsg}
            </Typography>
          )}
          <Typography
            level="body2"
            sx={{
              wordWrap: 'break-word',
              marginBottom: (theme) => theme.spacing(3),
              paddingX: (theme) => theme.spacing(4),
            }}
          >
            We will send a link to {email} for you to reset your password.
          </Typography>
          <Button sx={{ width: '100%' }} loading={processing} onClick={send}>
            Confirm
          </Button>
        </>
      ) : (
        <Typography level="body1" sx={{ wordWrap: 'break-word', paddingX: 4 }}>
          {tipMsg}
          <strong>{email}</strong>
        </Typography>
      )}
    </Box>
  );
};
export const ResetPwdLink = memo(({ email = 'wrong email was matched' }: { email: string }) => {
  const device = useDevice();
  const frame: FrameContextType | null = useContext(FrameContext);
  const handler = () => {
    frame?.openModal('textModal', {
      content: <ResetModal email={email} close={() => frame?.removeModal()} />,
      containerStyle: {
        maxWidth: device === 'mobile' ? '338px' : '570px',
        borderRadius: 0,
        textAlign: 'center',
        padding: '16px',
      },
    });
  };
  return (
    <ButtonLink
      handler={handler}
      restProps={{
        sx: {
          marginBottom: (theme: Theme) => theme.spacing(6),
        },
      }}
    >
      Forgot password?
    </ButtonLink>
  );
});
