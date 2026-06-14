'use client';
import * as React from 'react';
import {
  Avatar,
  Box,
  Stack,
  Typography,
  List,
  ListItem,
  Divider,
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Grid,
  useBreakpoints,
  Link,
  Loading,
} from '@castlery/fortress';
import {
  logout,
  SaleUser,
  selectedAdminUserInfo,
  selectedAdminUserName,
  selectedPosUmsUserEmail,
  selectedPosUmsUserName,
  useGetSaleUsersQuery,
} from '@castlery/modules-user-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useParams, useRouter } from 'next/navigation';
import { useAsyncFn } from 'react-use';
import { NextLink } from '@castlery/shared-components';
import { posRoutes, accessInAU } from '@castlery/config';
import { SalesRepLoginForm } from '../sales-rep-login-form/sales-rep-login-form';
import { selectedRetailId } from '@castlery/modules-retails-domain';
import { ShoppingBag, Account } from '@castlery/fortress/Icons';
import { cowboyLeadHelperLink } from './helper';
import { getPosUmsRoleUsers, PosUmsAuthService, type PosUmsRoleUser } from '@castlery/modules-user-services';
import { sharedFeatureService } from '@castlery/shared-services';
import { Copy } from '@castlery/fortress/Icons';

const enablePosUmsAuth = sharedFeatureService.enabledPosUmsAuth;

function getDisplayInitials(name?: string, email?: string) {
  const source = (name || '').trim();

  if (!source) {
    return 'PO';
  }

  const words = source.split(' ').filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0] || ''}${words[1]?.[0] || ''}`.toUpperCase();
  }

  return `${source[0] || ''}${source[1]?.[0] || ''}`.toUpperCase();
}

export const SwitchAdmin = ({ admin }: { admin: SaleUser }) => {
  const [open, setOpen] = React.useState(false);
  const retailId = useAppSelector(selectedRetailId);
  const router = useRouter();

  const handleAfterLogin = async () => {
    await router.replace(posRoutes.products);
    await window.location.reload();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <>
      <Stack
        direction={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        onClick={() => {
          setOpen(true);
        }}
      >
        <Avatar
          size="lg"
          sx={{
            backgroundColor: 'var(--fortress-palette-brand-terracotta-500)',
            color: 'var(--fortress-palette-brand-warmLinen-500)',
            fontSize: '20px',
          }}
        >
          {admin.firstname.substring(0, 2).toUpperCase()}
        </Avatar>
        <Typography>{admin.firstname}</Typography>
      </Stack>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <ModalDialog
          sx={{
            padding: 0,
          }}
        >
          <SalesRepLoginForm
            showBackBtn={false}
            defaultValues={{
              retailId: retailId,
              email: admin.email,
            }}
            onSuccess={handleAfterLogin}
          />
        </ModalDialog>
      </Modal>
    </>
  );
};

const UmsAdminListItem = ({
  user,
  setEmailCopied,
  locale,
}: {
  user: PosUmsRoleUser;
  setEmailCopied: (emailCopied: boolean) => void;
  locale: string;
}) => {
  return (
    <Stack direction={'column'} alignItems={'center'} justifyContent={'center'} gap={2}>
      <Avatar
        size="lg"
        sx={{
          backgroundColor: 'var(--fortress-palette-brand-terracotta-500)',
          color: 'var(--fortress-palette-brand-warmLinen-500)',
          cursor: 'pointer',
          fontSize: '20px',
        }}
        onClick={async (e) => {
          e.stopPropagation();
          // if (!user.email) return;
          void navigator.clipboard?.writeText(user.email);
          setEmailCopied(true);
          await PosUmsAuthService.getInstance(locale).signoutRedirect({
            state: {
              postLogoutRedirectPath: '/',
            },
          });
        }}
      >
        {getDisplayInitials(user.name, user.email)}
      </Avatar>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Typography
          level="body1"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {user.name}
        </Typography>
        {/* <Box
          role="button"
          aria-label={user.email ? `Copy ${user.email}` : 'Copy email'}
          sx={{
            display: 'inline-flex',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <Copy />
        </Box> */}
      </Box>
    </Stack>
  );
};

export const AdminList = ({ open }: { open: boolean }) => {
  const dispatch = useAppDispatch();
  const { mobile } = useBreakpoints();
  const adminUserInfo = useAppSelector(selectedAdminUserInfo);
  const legacyName = useAppSelector(selectedAdminUserName);
  const umsName = useAppSelector(selectedPosUmsUserName);
  const umsEmail = useAppSelector(selectedPosUmsUserEmail);
  const name = enablePosUmsAuth && umsName ? umsName : legacyName;
  const email = enablePosUmsAuth && umsEmail ? umsEmail : adminUserInfo?.email;
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'ca';
  const [umsRoleUsers, setUmsRoleUsers] = React.useState<PosUmsRoleUser[]>([]);
  const [umsRoleUsersError, setUmsRoleUsersError] = React.useState('');
  const [{ loading: umsRoleUsersLoading }, loadUmsRoleUsers] = useAsyncFn(async () => {
    const users = await getPosUmsRoleUsers({ locale });
    setUmsRoleUsers(users);
    setUmsRoleUsersError('');
    return users;
  }, [locale]);
  const { currentData: { results = [] } = {} } = useGetSaleUsersQuery(undefined, {
    skip: enablePosUmsAuth || !open,
  });
  const [emailCopied, setEmailCopied] = React.useState(false);
  React.useEffect(() => {
    if (!enablePosUmsAuth || !open) {
      return;
    }

    void loadUmsRoleUsers().catch(() => {
      setUmsRoleUsers([]);
      setUmsRoleUsersError('Unable to load users.');
    });
  }, [loadUmsRoleUsers, open]);
  return enablePosUmsAuth ? (
    <>
      <Modal open={emailCopied} onClose={() => setEmailCopied(false)}>
        <ModalDialog
          sx={{
            width: 'calc(80vw)',
            maxWidth: 640,
            '& .MuiModalClose-root': {
              top: mobile ? 24 : 28,
              right: mobile ? 16 : 24,
            },
          }}
        >
          <ModalClose />
          <Stack gap={6} justifyContent={'center'} alignItems={'center'}>
            <Typography level="h3">Heading to UMS Login</Typography>
            <Typography level="body2">User email copied! Paste it in UMS for easier login.</Typography>
            <Loading theme="dark" />
          </Stack>
        </ModalDialog>
      </Modal>
      <Box
        sx={{
          width: '100%',
          height: 48,
        }}
      />
      <Stack
        direction={mobile ? 'column' : 'row'}
        gap={mobile ? 2 : 6}
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: mobile ? 2 : 6,
        }}
      >
        <Stack sx={{ width: 200, justifyContent: 'center', alignItems: 'center' }}>
          <Stack gap={2} justifyContent={'center'} alignItems={'center'}>
            <Avatar
              size="lg"
              sx={{
                backgroundColor: 'var(--fortress-palette-brand-terracotta-500)',
                color: 'var(--fortress-palette-brand-warmLinen-500)',
                fontSize: '20px',
              }}
            >
              {getDisplayInitials(name, email)}
            </Avatar>
            <Typography level="body1">{name}</Typography>
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-500)' }}>
              {email}
            </Typography>
          </Stack>
          <Link
            variant="primary"
            sx={{
              mt: 6,
              display: 'block',
            }}
            onClick={async (e) => {
              e.stopPropagation();
              await PosUmsAuthService.getInstance(locale).signoutRedirect({
                state: {
                  postLogoutRedirectPath: '/',
                },
              });
            }}
          >
            Log Out
          </Link>
        </Stack>
        <Divider orientation={mobile ? 'horizontal' : 'vertical'} />
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            columnGap: 4,
            rowGap: 6,
            width: mobile ? '100%' : 390,
            maxHeight: 500,
            overflowY: 'auto',
          }}
        >
          {umsRoleUsers && umsRoleUsers?.length > 0 ? (
            umsRoleUsers.map((user) => (
              <Box key={user.id} sx={{ width: 80, height: 80 }}>
                <UmsAdminListItem user={user} setEmailCopied={setEmailCopied} locale={locale} />
              </Box>
            ))
          ) : (
            <Loading theme="dark" />
          )}
        </Stack>
      </Stack>
    </>
  ) : (
    <Stack direction={mobile ? 'column' : 'row'} spacing={mobile ? 1 : 2}>
      <Stack justifyContent={'center'} alignItems={'center'} spacing={2}>
        <Typography>Current User</Typography>
        <Stack justifyContent={'center'} alignItems={'center'}>
          <Avatar
            size="lg"
            sx={{
              backgroundColor: 'var(--fortress-palette-brand-terracotta-500)',
              color: 'var(--fortress-palette-brand-warmLinen-500)',
              fontSize: '20px',
            }}
          >
            {name.substring(0, 2).toUpperCase()}
          </Avatar>
          <Typography>{email}</Typography>
          <Typography>{name}</Typography>
        </Stack>
        <Button
          variant="tertiary"
          color="danger"
          onClick={async () => {
            if (enablePosUmsAuth) {
              await PosUmsAuthService.getInstance(locale).signoutRedirect({
                state: {
                  postLogoutRedirectPath: '/',
                },
              });
              return;
            }
            dispatch(logout({}));
          }}
        >
          Log Out
        </Button>
      </Stack>
      <Grid
        container
        spacing={{ xs: 2, lg: 4 }}
        // columns={{ xs: 4, sm: 8, md: 12 }}
        sx={{
          flexGrow: 1,
          //  TODO 这里要优化一下
          overflow: 'auto', // 添加这一行
          maxHeight: '70vh', // 你可以设置一个最大高度
          paddingBottom: mobile ? 16 : '',
        }}
      >
        {results?.map((user) => (
          <Grid item xs={3} key={user.id}>
            <SwitchAdmin admin={user} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export const AdminListModal = () => {
  const legacyName = useAppSelector(selectedAdminUserName);
  const umsName = useAppSelector(selectedPosUmsUserName);
  const name = enablePosUmsAuth && umsName ? umsName : legacyName;
  const { mobile } = useBreakpoints();
  const [open, setOpen] = React.useState<boolean>(false);
  return (
    <>
      <Stack
        onClick={() => {
          setOpen(true);
        }}
        role="button"
        direction={'column'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Avatar
          size="lg"
          sx={{
            '--Avatar-size': '5rem',
          }}
        >
          {name.substring(0, 2).toUpperCase()}
        </Avatar>
        <Typography
          sx={{
            marginTop: '20px',
          }}
        >
          {name}
        </Typography>
      </Stack>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <ModalDialog minWidth={664} layout={mobile ? 'fullscreen' : 'center'} sx={{ padding: 0 }}>
          <ModalClose />
          <AdminList open={open} />
        </ModalDialog>
      </Modal>
    </>
  );
};

export function PosMenu() {
  const dispatch = useAppDispatch();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'ca';
  const [{ loading }, handleLogout] = useAsyncFn(async () => {
    if (enablePosUmsAuth) {
      await PosUmsAuthService.getInstance(locale).signoutRedirect({
        state: {
          postLogoutRedirectPath: '/',
        },
      });
      return;
    }

    await dispatch(logout({}));
    // router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, [dispatch, locale]);
  return (
    <Box
      sx={{
        // height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <Stack
        gap={3}
        sx={(theme) => ({
          pt: theme.spacing(7),
          pb: theme.spacing(4),
        })}
      >
        <Stack direction={'column'} justifyContent={'center'} alignItems={'center'} spacing={2}>
          <AdminListModal />
        </Stack>
        <Divider />
        <List
          sx={{
            mx: 8,
            margin: '0 0 0 20px',
          }}
        >
          {[
            { label: 'Point-of-Sale', href: posRoutes.products },
            {
              label: 'Sale History',
              href: posRoutes.saleHistory + '?page=1',
            },
            ...(accessInAU
              ? [
                  {
                    label: 'Guest',
                    href: '',
                  },
                ]
              : []),
          ].map(({ label, href }) => (
            <ListItem
              key={label}
              sx={{
                textDecoration: 'none',
                '& svg, & a,& button': {
                  textDecoration: 'none',
                },
                '&:hover': {
                  '& svg, & a, & button': {
                    color: 'var(--fortress-palette-brand-terracotta-700)',
                  },
                },
                borderRight: 'none',
                marginBottom: '10px',
              }}
            >
              {label === 'Guest' ? (
                <>
                  <Account />
                  <Link
                    component="button"
                    onClick={() => {
                      window?.open(cowboyLeadHelperLink, '_blank');
                    }}
                    sx={{ fontSize: 'md' }}
                  >
                    {label}
                  </Link>
                </>
              ) : (
                <>
                  <ShoppingBag />
                  <NextLink href={href}>{label}</NextLink>
                </>
              )}
            </ListItem>
          ))}
        </List>
      </Stack>

      <Stack
        sx={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Link href={enablePosUmsAuth ? `${posRoutes.login}?changeStore=1` : '/'}>
          {enablePosUmsAuth ? 'Change Store' : 'Change Region'}
        </Link>
        <Link
          component={Button}
          loading={loading}
          onClick={handleLogout}
          sx={{
            marginBottom: '1rem',
            textTransform: 'none',
          }}
        >
          Logout
        </Link>
      </Stack>
    </Box>
  );
}

export default PosMenu;
