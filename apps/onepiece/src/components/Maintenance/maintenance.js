import React from 'react';
import lang from 'utils/lang';
import Helmet from 'react-helmet';
import style from './style.scss';

export default function () {
  const country = __COUNTRY__.toLowerCase();
  const contactUsLink =
    __COUNTRY__ === 'SG'
      ? `https://wa.me/${lang.t('common.whatsapp.value')}`
      : `tel:${lang.t('common.telephone.value')}`;

  return (
    <div className={`${style.maintenance}`}>
      <Helmet>
        <script type="text/javascript">{`
            window.addEventListener('load', function() {
              document.body.classList.add('${style.maintenance}__body');
            });
        `}</script>
      </Helmet>

      <div className={`${style.maintenance}__content`}>
        <h1>Coming Soon</h1>
        <div className={`${style.maintenance}__content__desc`}>
          <p>
            Our website is currently undergoing scheduled maintenance. We should be back shortly. Thank you for your
            patience.
            <br /> - The Castlery Team
          </p>
          <a className={`${style.maintenance}__content__contactUsBtn`} href={contactUsLink}>
            CONTACT US
          </a>
        </div>
      </div>

      <ul className={`${style.maintenance}__socialBtn`}>
        <li>
          <a href={`https://www.facebook.com/Castlery${__COUNTRY__}/`}>Facebook</a>
        </li>
        <li>
          <a href={`https://www.instagram.com/castlery${country}/`}>Instagram</a>
        </li>
      </ul>
    </div>
  );
}
