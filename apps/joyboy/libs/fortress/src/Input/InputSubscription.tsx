'use client';
import * as React from 'react';
import FormControl from '@mui/joy/FormControl';
// import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import { Sheet } from '@mui/joy';

interface InputSubscriptionProps {
  customSx?: any;
  onSubmit?: (e: { email: string }) => void;
  onSuccessChange?: () => void;
  onErrorChange?: () => void;
}

export default function InputSubscription(props: InputSubscriptionProps) {
  const { customSx, onSubmit = () => {}, onSuccessChange = () => {}, onErrorChange = () => {} } = props;
  const [data, setData] = React.useState<{
    email: string;
    status: 'initial' | 'loading' | 'failure' | 'sent';
  }>({
    email: '',
    status: 'initial',
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setData((current) => ({ ...current, status: 'loading' }));
    if (data?.email) {
      try {
        const res = await onSubmit({
          email: data.email,
        });
        console.log('🚀 ~ handleSubmit ~ res:', res);
        setData((current) => ({ ...current, status: 'sent' }));
        onSuccessChange();
      } catch (error) {
        console.log('🚀 ~ handleSubmit ~ error:', error);
        setData((current) => ({ ...current, status: 'failure' }));
        onErrorChange();
      }
    } else {
      return null;
    }
    // try {
    //   // Replace timeout with real backend operation
    //   setTimeout(() => {

    //     setData({ email: '123123', status: 'sent' });
    //   }, 1500);
    // } catch (error) {
    //   setData((current) => ({ ...current, status: 'failure' }));
    // }
  };

  return (
    <Sheet
      sx={{
        ...customSx,
      }}
    >
      <form onSubmit={handleSubmit} id="123">
        <FormControl>
          {/* <FormLabel
            sx={(theme) => ({
              // '--FormLabel-color': theme.vars.palette.brand.flour[10],
            })}
          >
            We make high-quality emails, too.
          </FormLabel> */}
          <Input
            id="general-subscription-email"
            sx={{ '--Input-decoratorChildHeight': '45px', '--Input-gap': 0 }}
            placeholder="email"
            type="email"
            required
            value={data.email}
            onChange={(event) => setData({ email: event.target.value, status: 'initial' })}
            error={data.status === 'failure'}
            endDecorator={
              <Button
                variant="solid"
                // color="primary"
                loading={data.status === 'loading'}
                type="submit"
                sx={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  backgroundColor: '#af9d76',
                }}
              >
                Subscribe
              </Button>
            }
          />
          {/* <FormHelperText sx={(theme) => ({ color: theme.vars.palette.danger[400] })}>sdasdasdas</FormHelperText> */}
          {data.status === 'failure' && (
            <FormHelperText sx={(theme) => ({ color: theme.vars.palette.danger[400] })}>
              Oops! something went wrong, please try again later.
            </FormHelperText>
          )}
          {data.status === 'sent' && (
            <FormHelperText sx={(theme) => ({ color: theme.vars.palette.primary[400] })}>
              You are all set!
            </FormHelperText>
          )}
        </FormControl>
      </form>
    </Sheet>
  );
}
