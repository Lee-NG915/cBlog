import React from 'react';

import { wrapPage } from 'utils/page';
import { getUrl } from 'pages';
import Banner from 'components/Banner';
// import DYWrapper from 'components/DYWrapper';
import { Container } from '@castlery/fortress';
import { HolidayMain, HolidayAbout, HolidayContents, HolidayFoot, HolidayAdd } from './holiday';

import style from './style.scss';

const Index = () => {
  const title = 'Celebrating in a Time of Change';
  const subtitle =
    'This year may be different, but the holidays don’t have to be. We show you how to make the most of the season with the things that matter. Like home, and the people we share it with.';
  const bannerProps = {
    SG: {
      mediaQueries: [
        {
          breakpoint: 'xs',
          srcset: '/static/holiday/holiday-banner-sofa-mobile.jpg',
          loader: { ratio: '0.81333' },
        },
        {
          breakpoint: 'lg',
          srcset: '/static/holiday/holiday-banner-sofa.jpg',
          loader: { ratio: '0.313' },
        },
      ],
      lazy: false,
      title: 'holiday',
    },
    US: {
      mediaQueries: [
        {
          breakpoint: 'xs',
          srcset: '/static/holiday/holiday-banner-sofa-mobile.jpg',
          loader: { ratio: '0.81333' },
        },
        {
          breakpoint: 'lg',
          srcset: '/static/holiday/holiday-banner-sofa.jpg',
          loader: { ratio: '0.313' },
        },
      ],
      lazy: false,
      title: 'holiday',
    },
    AU: {
      mediaQueries: [
        {
          breakpoint: 'xs',
          srcset: '/static/holiday/holiday-banner-sofa-mobile.jpg',
          loader: { ratio: '0.81333' },
        },
        {
          breakpoint: 'lg',
          srcset: '/static/holiday/holiday-banner-sofa.jpg',
          loader: { ratio: '0.313' },
        },
      ],
      lazy: false,
      title: 'holiday',
    },
  };
  const sectionProps = {
    SG: [
      {
        name: 'section-1',
        header: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main1-header-mobile.jpg',
                loader: { ratio: '1.437' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main1-header.jpg',
                loader: { ratio: '0.557' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          name: 'Micro-party',
          subName: '[mahy-kroh-pahr-tee] ',
          intros: [
            'A smaller scale but just-as-fun party to round out the year.',
            'A party with less fuss over presents and more food to go around.',
          ],
          about: 'noun',
        },
        about: {
          direction: 'right',
          src: '/static/holiday/main1-table.jpg',
          content: 'Honey, who shrunk the guest list? A smaller party just means less stress & more rest. ',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
        },
        contents: [
          // use grid render left->right top->bottom
          {
            src: '/static/holiday/main1-sofa.jpg',
            title: 'Our furniture’s party-proof.',
            intro:
              'Bottoms up! Most of our sofas come with partially or fully removable covers to tackle spillages from a tipsy tumble.',
            link: 'Shop Sofas > ',
            // linkHref: '/living-room/all-sofas',
            linkHref: getUrl('all-sofas'),
            direction: 'left',
            index: 1,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
          {
            src: '/static/holiday/main1-dining.jpg',
            title: '',
            intro:
              'Explore our range of dining tables — some extendable, all with plenty of room for festive feasting.',
            link: 'Shop Dining Tables > ',
            // linkHref: '/dining-room/dining-tables',
            linkHref: getUrl('dining-tables'),
            direction: 'right',
            index: 1,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
        ],
        footer: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main1-footer-mobile.jpg',
                loader: { ratio: '0.9' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main1-footer.jpg',
                loader: { ratio: '0.43' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          intro:
            'A living space that changes with your needs? Shop modular designs that free up room for mingling, or even a mini dance floor.',
          link: 'Shop Modular Collections > ',
          // storyblock sale pages
          linkHref: '/modular-collections',
        },
      },
      {
        name: 'section-2',
        header: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main2-header-mobile.jpg',
                loader: { ratio: '1.437' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main2-header.jpg',
                loader: { ratio: '0.557' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          name: 'Nest & chill ',
          subName: '[nest-uhn-chil] ',
          intros: [
            'Like Netflix & Chill, but for 2020 — Involves filling your nest with beautiful things ‘cause you’re chilling a lot more at home.',
            'Spending time freed from the usual, crazy night out to stay in and spruce up that little reading nook you’ve carved.',
          ],
          about: 'verb',
        },
        about: {
          direction: 'left',
          src: '/static/holiday/main2-bed.jpg',
          content: 'What every(home)body has time for these days, and what every home needs to feel even cosier.',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
        },
        contents: [
          // use grid render left->right top->bottom
          {
            src: '/static/holiday/main2-dining.jpg',
            title: 'Purge the pile-up. ',
            intro:
              'That heap of stuff? Quite the eyesore. When packed into stylish storage furniture? A feast for the eyes.',
            link: 'Shop Storage > ',
            // linkHref: '/storage/all-storage',
            linkHref: getUrl('all-storage'),
            direction: 'right',
            index: 2,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
          {
            src: '/static/holiday/main2-double-bed.jpg',
            title: 'Curl up in bed.',
            intro: `We won't be going far-la-la to a Christmas market in Europe, but one can dream. Might as well do so in comfort and style. `,
            link: 'Shop Bedroom > ',
            // linkHref: '/bedroom/all-bedroom',
            linkHref: getUrl('all-bedroom'),
            direction: 'left',
            index: 2,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
        ],
        add: {
          src: '/static/holiday/main2-sofa.jpg',
          loader: { ratio: '0.82' },
          intro: `We deserve it for getting through 2020. This year's notes to Santa? Less vacation tickets, more home essentials — `,
          head: 'Spoil a loved one (or yourself!) ',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
          link: 'See what’s on our wish list >',
          linkHref: '/blog/castlery-holiday-wishlist',
        },
      },
    ],
    US: [
      {
        name: 'section-1',
        header: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main1-header-mobile.jpg',
                loader: { ratio: '1.437' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main1-header.jpg',
                loader: { ratio: '0.557' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          name: 'Micro-party',
          subName: '[mahy-kroh-pahr-tee] ',
          intros: [
            'A smaller scale but just-as-fun party to round out the year.',
            'A perfectly-sized party where you can cut back on the prep work, yet still pass out on the sofa from all that turkey.',
          ],
          about: 'noun',
        },
        about: {
          direction: 'right',
          src: '/static/holiday/main1-table.jpg',
          content: 'Honey, who shrunk the guest list? A smaller party just means less stress & more rest. ',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
        },
        contents: [
          // use grid render left->right top->bottom
          {
            src: '/static/holiday/main1-sofa.jpg',
            title: 'Our furniture’s party-proof.',
            intro:
              'Bottoms up! Most of our sofas come with partially or fully removable covers to tackle spillages from a tipsy tumble.',
            link: 'Shop Sofas > ',
            linkHref: getUrl('all-sofas'),
            // linkHref: '/living-room/all-sofas',
            direction: 'left',
            index: 1,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
          {
            src: '/static/holiday/main1-dining.jpg',
            title: '',
            intro:
              'Explore our range of dining tables — some extendable, all with plenty of room for festive feasting.',
            link: 'Shop Dining Tables > ',
            linkHref: getUrl('dining-tables'),
            // linkHref: '/dining-room/dining-tables',
            direction: 'right',
            index: 1,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
        ],
        footer: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main1-footer-mobile.jpg',
                loader: { ratio: '0.9' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main1-footer.jpg',
                loader: { ratio: '0.43' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          intro:
            'A living space that changes with your needs? Shop modular designs that free up room for mingling, or even a mini dance floor.',
          link: 'Shop Modular Collections > ',
          linkHref: getUrl('modular-collections'),
          // linkHref: '/living-room/modular-collections',
        },
      },
      {
        name: 'section-2',
        header: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main2-header-mobile.jpg',
                loader: { ratio: '1.437' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main2-header.jpg',
                loader: { ratio: '0.557' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          name: 'Nest & chill ',
          subName: '[nest-uhn-chil] ',
          intros: [
            'Like Netflix & Chill, but for 2020 — Involves filling your nest with beautiful things ‘cause you’re chilling a lot more at home.',
            'Spending time freed from the usual, crazy night out to stay in and spruce up that little reading nook you’ve carved.',
          ],
          about: 'verb',
        },
        about: {
          direction: 'left',
          src: '/static/holiday/main2-bed.jpg',
          content: 'What every(home)body has time for these days, and what every home needs to feel even cozier.',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
        },
        contents: [
          // use grid render left->right top->bottom
          {
            src: '/static/holiday/main2-dining.jpg',
            title: 'Purge the pile-up. ',
            intro:
              'That heap of stuff? Quite the eyesore. When packed into stylish storage furniture? A feast for the eyes.',
            link: 'Shop Storage > ',
            // linkHref: '/storage/all-storage',
            linkHref: getUrl('all-storage'),
            direction: 'right',
            index: 2,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
          {
            src: '/static/holiday/main2-double-bed.jpg',
            title: 'Curl up in bed.',
            intro: `Snowed in? What a bummer. Extra hours in a blanket burrito? Now that's something to beat the winter blues. `,
            link: 'Shop Bedroom > ',
            linkHref: getUrl('all-bedroom'),
            // linkHref: '/bedroom/all-bedroom',
            direction: 'left',
            index: 2,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
        ],
      },
      {
        name: 'section-3',
        header: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main3-header-mobile.jpg',
                loader: { ratio: '1.437' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main3-header.jpg',
                loader: { ratio: '0.557' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          name: 'LDR',
          subName: '[el-dee-ar] ',
          intros: [
            'Informal abbreviation for “long distance reunion”. ',
            'Celebrating the Holidays with Mom, Dad and a screen in between. ',
          ],
          about: 'abbreviation ',
        },
        about: {
          direction: 'right',
          src: '/static/holiday/main3-vlada.jpg',
          content:
            'Aren’t we lucky to be living in a time of video conferencing? Cue the LDR you actually wouldn’t mind.',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
        },
        contents: [
          // use grid render left->right top->bottom
          {
            src: '/static/holiday/main3-bookshelf.jpg',
            title: 'Our tips for pulling off your virtual celebrations:  ',
            intro:
              'Build a visually interesting background (that’s real!), consider a pretty shelf to flaunt your mementos, plants & more.',
            link: 'Shop Shelving > ',
            linkHref: getUrl('shelves-cabinets'),
            direction: 'left',
            index: 1,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
          {
            src: '/static/holiday/main3-bed.jpg',
            title: '',
            intro: `Plug in the TV and scale up the virtual fun! Our range of TV stands hide ugly cables while giving your interiors a stylish uplift. `,
            link: 'Shop TV Stands > ',
            // linkHref: '/living-room/tv-stands',
            linkHref: getUrl('tv-consoles'),
            direction: 'right',
            index: 1,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
        ],
        add: {
          src: '/static/holiday/main2-sofa.jpg',
          loader: { ratio: '0.82' },
          intro: `We deserve it for getting through 2020. This year's notes to Santa? Less vacation tickets, more home essentials — `,
          head: 'Spoil a loved one (or yourself!) ',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
          link: 'See what’s on our wish list >',
          linkHref: '/blog/castlery-holiday-wishlist',
        },
      },
    ],
    AU: [
      {
        name: 'section-1',
        header: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main1-header-mobile.jpg',
                loader: { ratio: '1.437' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main1-header.jpg',
                loader: { ratio: '0.557' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          name: 'Micro-party',
          subName: '[mahy-kroh-pahr-tee] ',
          intros: [
            'A smaller scale but just-as-fun party to round out the year.',
            'BBQing and drinking beer in your boardies, just with much more to go around.',
          ],
          about: 'noun',
        },
        about: {
          direction: 'right',
          src: '/static/holiday/main1-table.jpg',
          content: 'Honey, who shrunk the guest list? A smaller party just means less stress & more rest. ',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
        },
        contents: [
          // use grid render left->right top->bottom
          {
            src: '/static/holiday/main1-sofa.jpg',
            title: 'Our furniture’s party-proof.',
            intro:
              'Bottoms up! Most of our sofas come with partially or fully removable covers to tackle spillages from a tipsy tumble.',
            link: 'Shop Sofas > ',
            // linkHref: '/living-room/all-sofas',
            linkHref: getUrl('all-sofas'),
            direction: 'left',
            index: 1,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
          {
            src: '/static/holiday/main1-dining.jpg',
            title: '',
            intro:
              'Explore our range of dining tables — some extendable, all with plenty of room for festive feasting.',
            link: 'Shop Dining Tables > ',
            // linkHref: '/dining-room/dining-tables',
            linkHref: getUrl('dining-tables'),
            direction: 'right',
            index: 1,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
        ],
        footer: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main1-footer-mobile.jpg',
                loader: { ratio: '0.9' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main1-footer.jpg',
                loader: { ratio: '0.43' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          intro:
            'A living space that changes with your needs? Shop modular designs that free up room for mingling, or even a mini dance floor.',
          link: 'Shop Modular Collections > ',
          linkHref: '/modular-collections',
        },
      },
      {
        name: 'section-2',
        header: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main2-header-mobile.jpg',
                loader: { ratio: '1.437' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main2-header.jpg',
                loader: { ratio: '0.557' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          name: 'Nest & chill ',
          subName: '[nest-uhn-chil] ',
          intros: [
            'Like Netflix & Chill, but for 2020 — Involves filling your nest with beautiful things ‘cause you’re chilling a lot more at home.',
            'Spending time freed from the usual, crazy night out to stay in and spruce up that little reading nook you’ve carved.',
          ],
          about: 'verb',
        },
        about: {
          direction: 'left',
          src: '/static/holiday/main2-bed.jpg',
          content: 'What every(home)body has time for these days, and what every home needs to feel even cosier.',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
        },
        contents: [
          // use grid render left->right top->bottom
          {
            src: '/static/holiday/main2-dining.jpg',
            title: 'Purge the pile-up. ',
            intro:
              'That heap of stuff? Quite the eyesore. When packed into stylish storage furniture? A feast for the eyes.',
            link: 'Shop Storage > ',
            // linkHref: '/storage/all-storage',
            linkHref: getUrl('all-storage'),
            direction: 'right',
            index: 2,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
          {
            src: '/static/holiday/main2-double-bed.jpg',
            title: 'Curl up in bed.',
            intro: `Hot outside? All the more reason to retreat indoors and spend the extra hours in your happy place.`,
            link: 'Shop Bedroom > ',
            // linkHref: '/bedroom/all-bedroom',
            linkHref: getUrl('all-bedroom'),
            direction: 'left',
            index: 2,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
        ],
      },
      {
        name: 'section-3',
        header: {
          bannerProps: {
            mediaQueries: [
              {
                breakpoint: 'xs',
                srcset: '/static/holiday/main3-header-mobile.jpg',
                loader: { ratio: '1.437' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/holiday/main3-header.jpg',
                loader: { ratio: '0.557' },
              },
            ],
            lazy: true,
            title: 'holiday',
          },
          name: 'LDR',
          subName: '[el-dee-ar] ',
          intros: [
            'Informal abbreviation for “long distance reunion”. ',
            'Celebrating the Holidays with Mum, Dad and a screen in between. ',
          ],
          about: 'abbreviation ',
        },
        about: {
          direction: 'right',
          src: '/static/holiday/main3-vlada.jpg',
          content:
            'Aren’t we lucky to be living in a time of video conferencing? Cue the LDR you actually wouldn’t mind.',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
        },
        contents: [
          // use grid render left->right top->bottom
          {
            src: '/static/holiday/main3-bookshelf.jpg',
            title: 'Our tips for pulling off your virtual celebrations: ',
            intro:
              'Build a visually interesting background (that’s real!), consider a pretty shelf to flaunt your mementos, plants & more.',
            link: 'Shop Shelving > ',
            linkHref: getUrl('shelves-cabinets'),
            direction: 'left',
            index: 1,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
          {
            src: '/static/holiday/main3-bed.jpg',
            title: '',
            intro: `Plug in the TV and scale up the virtual fun! Our range of TV consoles hide ugly cables while giving your interiors a stylish uplift. `,
            link: 'Shop TV Consoles > ',
            // linkHref: '/living-room/entertainment-units',
            linkHref: getUrl('tv-consoles'),
            direction: 'right',
            index: 1,
            loader: { ratio: '0.9' },
            width: {
              mobile: 1,
              desktop: 0.25,
            },
          },
        ],
        add: {
          src: '/static/holiday/main2-sofa.jpg',
          loader: { ratio: '0.82' },
          intro: `We deserve it for getting through 2020. This year's notes to Santa? Less vacation tickets, more home essentials — `,
          head: 'Spoil a loved one (or yourself!) ',
          width: {
            mobile: 1,
            desktop: 0.5,
          },
          link: 'See what’s on our wish list >',
          linkHref: '/blog/castlery-holiday-wishlist',
        },
      },
    ],
  };
  const dyProps = {
    SG: [
      {
        campaign: 'LP Holiday Sale (Before Christmas)',
      },
      {
        campaign: 'LP Holiday Sale (All)',
      },
    ],
    US: [
      {
        campaign: 'LP Holiday Sale (All)',
      },
    ],
    AU: [
      {
        campaign: 'LP Holiday Sale (Before Christmas)',
      },
      {
        campaign: 'LP Holiday Sale (All)',
      },
    ],
  };
  return (
    <div className={style.holiday}>
      <Container>
        <Banner {...bannerProps[__COUNTRY__]} className={`${style.holiday}__shadow`}>
          <h1 className={`${style.holiday}__title`}>{title}</h1>
        </Banner>
      </Container>

      <div className={`${style.holiday}__intro`}>
        <div className={`${style.holiday}__intro-detail`}>{subtitle}</div>
      </div>

      <Container maxWidth="md">
        {sectionProps[__COUNTRY__].map((sectionProp) => (
          <React.Fragment key={sectionProp.name}>
            <HolidayMain {...sectionProp.header} className={`${style.holiday}__sectionHead`} />
            <HolidayAbout {...sectionProp.about} className={`${style.holiday}__sectionAbout`} />
            <HolidayContents contents={sectionProp.contents} className={`${style.holiday}__sectionContent`} />
            {sectionProp.footer && <HolidayFoot {...sectionProp.footer} className={`${style.holiday}__sectionFoot`} />}
            {sectionProp.add && <HolidayAdd {...sectionProp.add} className={`${style.holiday}__sectionAdd`} />}
            {!sectionProp.footer && !sectionProp.add && <div className={`${style.holiday}__sectionPlaceholder`} />}
          </React.Fragment>
        ))}
      </Container>

      <Container maxWidth="md">
        {dyProps[__COUNTRY__].map(({ campaign }) => (
          <div key={campaign} className={`${style.holiday}__recommend`} data-campaign={campaign} />
          // <DYWrapper
          //   key={campaign}
          //   campaign={campaign}
          //   render={(selector) => (
          //     <div className={`${style.holiday}__recommend`}>
          //       <div id={selector} />
          //     </div>
          //   )}
          // />
        ))}
      </Container>
    </div>
  );
};

export default wrapPage()(Index);
