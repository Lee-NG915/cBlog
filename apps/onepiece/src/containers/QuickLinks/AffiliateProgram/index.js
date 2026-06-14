import React from 'react';
import { wrapPage } from 'utils/page';
import PageHeader from 'components/PageHeader';
import { CommonLink } from 'components/Header/GlobalNav';
import { Container } from '@castlery/fortress';
import style from './style.scss';

const SECTIONS = [
  {
    description: 'Get access to personalized marketing support to boost conversion rates',
  },
  {
    description:
      'The more you sell, the more you make. Earn up to 20% commission, adjusted each month based on monthly performance',
  },
  {
    description:
      'All products are eligible for commissions and come with a minimum of 30-day tracking window, making it easier to close the sale',
  },
];

const handleCountryLinkGo = () => {
  switch (__COUNTRY__) {
    case 'SG':
      return 'https://app.impact.com/campaign-promo-signup/Castlery-SG.brand?execution=e27s1';
    case 'AU':
      return 'https://app.impact.com/campaign-promo-signup/Castlery-AU.brand?execution=e35s1';
    case 'US':
      return 'https://app.impact.com/campaign-promo-signup/Castlery-US.brand?execution=e28s1';
    default:
      return 'https://app.impact.com/campaign-promo-signup/Castlery-SG.brand?execution=e27s1';
  }
};

const AffiliateProgram = () => (
  <Container>
    <PageHeader
      mediaQueries={[
        {
          breakpoint: 'xs',
          srcset: '/v1671608413/static/affiliate-registration/Top_mobile.jpg',
          loader: { ratio: '0.813333333' },
        },
        {
          breakpoint: 'lg',
          srcset: '/v1671608413/static/affiliate-registration/Top_desktop.jpg',
          loader: { ratio: '0.416666667' },
        },
      ]}
      lazy={false}
      title="Affiliate Program"
      mainTitle="Affiliate Program"
      mainIntro="A stylish, modern furniture brand making waves in Affiliate Marketing."
      subTitle="Sign up to be an Affiliate"
      subIntro="As a Castlery affiliate, you'll make a commission for every purchase made through your affiliate link."
    />

    <div className={`${style.affr}__sections`}>
      {SECTIONS.map((section, index) => (
        <div key={index} className={`${style.affr}__section`}>
          <div className={`${style.affr}__section-description`}>{section.description}</div>
        </div>
      ))}
    </div>

    <div className={`${style.affr}__registration`}>
      <h2>Become An Affiliate</h2>
      <p className={`${style.affr}__registration__des`}>
        <CommonLink
          linkProps={{
            path: handleCountryLinkGo(),
            menuType: 'secondType',
            text: 'Join our affiliate program',
            target: '_blank',
          }}
        >
          Join our affiliate program
        </CommonLink>{' '}
        and we'll contact you once we have reviewed and approved your site.{' '}
      </p>
    </div>
  </Container>
);

export default wrapPage()(AffiliateProgram);
