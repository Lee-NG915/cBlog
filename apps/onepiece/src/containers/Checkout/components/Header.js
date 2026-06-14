import React from 'react';
import Logo from 'components/Logo';
import { getUrl } from 'pages';
import { Link } from 'react-router';
import NoticeBar from 'components/NoticeBar';
import lang from 'utils/lang';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Container, Stack } from '@castlery/fortress';
import style from './style.scss';

const Header = () => {
  const { desktop } = useBreakpoints();
  return (
    <div className={style.header}>
      <NoticeBar />
      <Container fixed>
        <Stack
          direction="row"
          className={`${style.header}__container`}
          sx={{
            ...(desktop && {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }),
          }}
        >
          <Link href={__BASE_URL__}>
            <Logo />
          </Link>
          {desktop && (
            <div className={`${style.header}__help`}>
              <span>
                Need help?&nbsp;
                {__COUNTRY__ === 'SG' ? (
                  <a href={`https://wa.me/${lang.t('common.whatsapp.value')}`}>
                    WhatsApp {lang.t('common.whatsapp.presentation')}
                  </a>
                ) : (
                  <a href={`tel:${lang.t('common.telephone.value')}`}>{lang.t('common.telephone.presentation')}</a>
                )}
              </span>
              <span>
                {__COUNTRY__ === 'SG' && 'Mon - Sun: 10:00am - 9:00pm'}
                {/* {__COUNTRY__ === 'AU' && 'Mon - Fri: 9:30am - 8:00pm, Sat - Sun: 10:00am - 8:00pm'} */}
              </span>
            </div>
          )}
        </Stack>
      </Container>
    </div>
  );
};

export default Header;
