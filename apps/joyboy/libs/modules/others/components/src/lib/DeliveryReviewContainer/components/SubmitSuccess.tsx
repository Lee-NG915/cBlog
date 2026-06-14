'use client';

import { Button, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { Cancel, CheckCircle } from '@castlery/fortress/Icons';
import { useParams, useRouter } from 'next/navigation';

const SubmitSuccess = () => {
  const { desktop } = useBreakpoints();
  const router = useRouter();
  const params = useParams();
  const region = params.region as string;

  const handleButtonClick = () => {
    router.push(`/${region}`);
  };
  if (!desktop) {
    return (
      <Stack
        sx={(theme) => ({
          alignItems: 'center',
          padding: `0 ${theme.spacing(6)} ${theme.spacing(10)} ${theme.spacing(6)}`,
        })}
      >
        <CheckCircle sx={(theme) => ({ width: theme.spacing(20), height: theme.spacing(20), mb: theme.spacing(6) })} />
        <Typography level="body1" sx={(theme) => ({ mb: theme.spacing(10), textAlign: 'center' })}>
          Thank you for sharing your experience!
        </Typography>
        <Button sx={{ width: '100%' }} onClick={handleButtonClick}>
          CONTINUE SHOPPING
        </Button>
      </Stack>
    );
  }
  return (
    <Stack
      sx={(theme) => ({
        width: '100%',
        padding: `0 ${theme.spacing(15)} ${theme.spacing(30)} ${theme.spacing(15)}`,
        alignItems: 'center',
      })}
    >
      <CheckCircle sx={(theme) => ({ width: theme.spacing(20), height: theme.spacing(20), mb: theme.spacing(6) })} />
      <Typography level="body1" sx={(theme) => ({ mb: theme.spacing(10), textAlign: 'center' })}>
        Thank you for sharing your experience!
      </Typography>
      <Button onClick={handleButtonClick}>CONTINUE SHOPPING</Button>
    </Stack>
  );
};

export { SubmitSuccess };
