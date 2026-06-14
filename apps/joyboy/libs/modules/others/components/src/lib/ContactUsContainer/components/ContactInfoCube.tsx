import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { FortressImage, NextFortressLink, getCustomerServiceApi } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectedActiveUser } from '@castlery/modules-user-domain';

type ContactInfoCubeProps = {
  title: string;
  thumbnail: string;
  list: {
    type: string;
    linkContent?: string;
    linkUrl?: string;
    textContent?: string[];
  }[];
  note?: string;
};

const ContactInfoCube = ({ title, thumbnail, list, note }: ContactInfoCubeProps) => {
  const currentUser = useAppSelector(selectedActiveUser);
  const { desktop } = useBreakpoints();

  const handleCasaButtonClick = () => {
    getCustomerServiceApi()
      .then((api) => api.openChat())
      .catch(() => console.warn('Customer Service SDK not available'));
  };

  return (
    <Stack
      alignItems="center"
      sx={(theme) => ({
        padding: `0 10px`,
        flex: 1,
        minWidth: 0, // 允许内容收缩，确保flex正常工作
        ...(!desktop && {
          mb: theme.spacing(6),
        }),
      })}
    >
      <FortressImage
        src={thumbnail}
        alt="Contact Info Cube"
        imageWidth={desktop ? 80 : 60}
        imageHeight={desktop ? 80 : 60}
        sx={(theme) => ({
          '--AspectRatio-paddingBottom': 0,
          mb: theme.spacing(3),
        })}
      />
      <Typography level="h4" sx={(theme) => ({ mb: theme.spacing(3) })}>
        {title}
      </Typography>
      {list.map((item, index) => {
        if (item.type === 'Casa button') {
          return (
            <Stack
              direction="row"
              alignItems="center"
              gap={2}
              key={index}
              onClick={handleCasaButtonClick}
              sx={(theme) => ({
                mb: index === list.length - 1 ? 0 : theme.spacing(4),
                pt: '3px',
                color: theme.palette.brand.burntOrange[500],
                '&:hover': {
                  color: theme.palette.brand.burntOrange[600],
                },
                cursor: 'pointer',
              })}
            >
              <Typography
                sx={(theme) => ({
                  fontSize: desktop ? '20px !important' : '16px !important',
                  lineHeight: desktop ? '20px' : '16px',
                  borderBottom: `2px solid ${theme.palette.brand.burntOrange[500]}`,
                })}
              >
                {item.linkContent}
              </Typography>
              <ArrowRight />
            </Stack>
          );
        }
        if (item.type === 'gladly button') {
          return (
            <Stack
              direction="row"
              alignItems="center"
              gap={2}
              key={index}
              onClick={() => {
                getCustomerServiceApi()
                  .then(async (api) => {
                    if (currentUser) {
                      const name = `${currentUser.firstname || ''} ${currentUser.lastname || ''}`;
                      const email = currentUser.email;
                      await api.setUser({ name, email });
                    }
                    await api.openChat();
                  })
                  .catch(() => console.warn('Customer Service SDK not available'));
              }}
              sx={(theme) => ({
                mb: index === list.length - 1 ? 0 : theme.spacing(4),
                pt: '3px',
                color: theme.palette.brand.burntOrange[500],
                '&:hover': {
                  color: theme.palette.brand.burntOrange[600],
                },
                cursor: 'pointer',
              })}
            >
              <Typography
                sx={(theme) => ({
                  fontSize: desktop ? '20px !important' : '16px !important',
                  lineHeight: desktop ? '20px' : '16px',
                  borderBottom: `2px solid ${theme.palette.brand.burntOrange[500]}`,
                })}
              >
                {item.linkContent}
              </Typography>
              <ArrowRight />
            </Stack>
          );
        }
        if (item.type === 'link') {
          if (!item.linkUrl) {
            return (
              <Typography
                level="body2"
                sx={(theme) => ({
                  fontSize: desktop ? '20px !important' : '16px !important',
                  lineHeight: desktop ? '20px' : '16px',
                  color: theme.palette.brand.burntOrange[500],
                  mb: index === list.length - 1 ? 0 : theme.spacing(4),
                })}
              >
                {item.linkContent}
              </Typography>
            );
          }
          return (
            <NextFortressLink
              key={index}
              href={item.linkUrl}
              endDecorator={<ArrowRight />}
              sx={(theme) => ({
                mb: index === list.length - 1 ? 0 : theme.spacing(4),
                color: theme.palette.brand.burntOrange[500],
                fontSize: desktop ? '20px !important' : '16px !important',
                lineHeight: desktop ? '20px' : '16px',
                textDecorationColor: theme.palette.brand.burntOrange[500],
                '&:hover': {
                  color: theme.palette.brand.burntOrange[600],
                  textDecorationColor: theme.palette.brand.burntOrange[600],
                },
              })}
            >
              {item.linkContent}
            </NextFortressLink>
          );
        }
        return (
          <Stack
            direction="row"
            alignItems="center"
            gap={3}
            sx={(theme) => ({ mb: index === list.length - 1 ? 0 : theme.spacing(6) })}
            key={index}
          >
            <Typography level="body2">{item.textContent?.[0]}</Typography>
            <Typography level="body2">{item.textContent?.[1]}</Typography>
          </Stack>
        );
      })}
      {note && (
        <Typography
          sx={(theme) => ({
            fontSize: '14px !important',
            fontWeight: '400',
            lineHeight: 1.2,
            color: theme.palette.brand.mono[700],
            maxWidth: '265px',
            textAlign: 'center',
            mt: theme.spacing(3),
          })}
        >
          {note}
        </Typography>
      )}
    </Stack>
  );
};

export { ContactInfoCube };
