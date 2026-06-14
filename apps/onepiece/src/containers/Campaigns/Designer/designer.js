import React from 'react';
import PropTypes from 'prop-types';

import { withUseBreakpoints, wrapPage } from 'utils/page';
import { getUrl } from 'pages';
import { addKnightPrefix } from 'pages/util.js';
import { renderImage } from 'utils/image';
import Banner from 'components/Banner';
import ReactSVG from 'components/ReactSVG';
import Helmet from 'components/Helmet';
import { Link } from 'react-router';
import Breadcrumbs from 'components/Breadcrumbs';

import { enableSpecializesSpell } from 'config';
import style from './style.scss';

@wrapPage({ border: true })
@withUseBreakpoints
export default class Designer extends React.Component {
  static propTypes = {
    designer: PropTypes.string.isRequired,
    location: PropTypes.object,
    breakpoints: PropTypes.object,
  };

  render() {
    const {
      designer,
      location,
      breakpoints: { desktop },
    } = this.props;

    const designers = {
      'yonoh-studio': {
        name: 'Yonoh Studio',
        country: 'Spain',
        description:
          'Yonoh is a multidisciplinary creative studio set up by Clara del Portillo and Alex Selma. ' +
          'The studio is characterized by its simple, yet functional designs. Simplicity, innovation and originality,' +
          ' without extravagance, is the backbone to their design philosophy. <br><br>' +
          'They enjoy studying each small detail minutely in each of their projects. Their versatility, timelessness ' +
          'and adaptability are the cornerstones of the work done in their studio.',
        handle: '@yonohestudio',
        imageDesktop: '/v1534327552/static/designer/yonoh-desktop.jpg',
        imageMobile: '/v1534255992/static/designer/yonoh-mobile.jpg',
        awards: ['2019 / ADCV Gold Award', '2019 / German Design Award Special', '2018 / IF Design Award'],
        collection: {
          name: 'Bambu Collection',
          imageDesktop: '/static/designer/updated-bambu-collection.png',
          imageMobile: '/static/designer/bambu-collection-mobile.png',
          link: 'bambu-collection',
        },
      },
      'paolo-cappello': {
        name: 'Paolo Cappello',
        country: 'Italy',
        description:
          'Created with Italian designer Paolo Capello, the Strato collection is complete with gentle curves and distinctive walnut-and-black oak veneers, lending a graceful touch to any room.',
        handle: '@paoloandcappello',
        imageDesktop: '/static/designer/paolo-desktop.jpg',
        imageMobile: '/static/designer/paolo-mobile.jpg',
        awards: [
          '2015 / Contemporary Design Award first prize with Caruso for Miniforms',
          '2018 / Design Intelligence Award China',
          '2018 / European Product Design Award, Product Designer of the Year',
        ],
        collection: {
          name: 'Strato Collection',
          imageDesktop: '/static/designer/strato-collection-v2.jpg',
          imageMobile: '/static/designer/strato-collection-mobile-v2.jpg',
          link: 'strato-collection',
        },
        seoDescription:
          'Created in collaboration with Italian designer Paolo Capello, the Strato collection highlights gentle curves that lend a graceful touch to any room.',
      },
      'krystian-kowalski': {
        name: 'Krystian Kowalski',
        country: 'Poland',
        description:
          "Krystian Kowalski's work is focused on finding intelligent, human-centred solutions " +
          'that exceed the obvious & attempt to offer a fresh and observational approach to any given problem.<br><br>' +
          'He is a designer-maker who combined technology research, advanced 3D modelling with manual skills. His love ' +
          'for making gives him a unique perspective on manufacturing solutions, material qualities and the DNA of each ' +
          'particular product.',
        handle: '@krystian_kowalski_kkid',
        imageDesktop: '/v1534327552/static/designer/kowalski-desktop.jpg',
        imageMobile: '/v1534255992/static/designer/kowalski-mobile.jpg',
        awards: [
          '2018 / Instytut of Industrial Design – Designer Of The Year',
          '2018 / Grace – German Design Award Winner',
          '2018 / Grace – Good Design Award',
        ],
        collection: {
          name: 'Luna Collection',
          imageDesktop: '/static/designer/luna-collection.png',
          imageMobile: '/static/designer/luna-collection-mobile.png',
          link: 'luna-collection',
        },
        seoDescription:
          'Designer-maker Krystian Kowalski combines technology research and advanced 3D modelling with manual skills, offering a fresh perspective in his works.',
      },
      'charles-wilson': {
        name: 'Charles Wilson',
        country: 'Australia',
        description:
          'Charles Wilson is an Australian industrial designer based in Sydney, who started a workshop, ' +
          'ARGO in the 1990s to develop experimental furniture and objects.<br><br>' +
          'His practice also encompasses limited edition and bespoke pieces, especially in his collaborations with ' +
          'Broached Commissions, specialising in narrative-driven conceptual editions.',
        handle: '@charleswilsondesign',
        imageDesktop: '/v1534327552/static/designer/charles-desktop.jpg',
        imageMobile: '/v1534255992/static/designer/charles-mobile.jpg',
        awards: ['Menu Candelbra – Australian Design Award', 'Spool Seating – Bombay Sapphire Award'],
        collection: {
          name: 'Gable Collection',
          imageDesktop: '/static/designer/gable-collection.png',
          imageMobile: '/static/designer/gable-collection-mobile.png',
          link: 'gable-collection',
        },
        seoDescription: `Australian industrial designer Charles Wilson ${
          enableSpecializesSpell ? 'specializes' : 'specialises'
        } in narrative-driven designs. His practice comprises limited edition and bespoke pieces.`,
      },
      'daniel-emma': {
        name: 'Daniel Emma',
        country: 'Australia',
        description:
          'Daniel Emma is a design studio based in Adelaide. Established by Daniel To and Emma Aiston in 2008, ' +
          'the studio was created to enable the duo to express thoughts through industrial design.<br><br>' +
          'They look to create the unexpected from simple objects using simple forms, drawing influence and insight from ' +
          'the diverse culture that Australia presents them with.',
        handle: '@daniel_emma',
        imageDesktop: '/static/designer/danielemma-desktop.jpg',
        imageMobile: '/static/designer/danielemma-mobile.jpg',
        collection: {
          name: 'Space Collection',
          imageDesktop: '/static/designer/space-collection.png',
          imageMobile: '/static/designer/space-collection-mobile.png',
          link: 'space-collection',
        },
      },
      'james-harrison': {
        name: 'James Harrison',
        country: 'United Kingdom',
        description:
          'As part of Castlery’s international designer series, the Lily collection by British James Harrison features sleek silhouettes juxtaposed with striking chevron patterns.',
        handle: '@jamesukdesign',
        imageDesktop: '/static/designer/james-desktop.jpg',
        imageMobile: '/static/designer/james-mobile.jpg',
        awards: ['2006 / CMP Young Designer of the Year', '2006 / Living Etc’s Best New Designer'],
        collection: {
          name: 'Lily Collection',
          imageDesktop: '/static/designer/lily-collection-v2.jpg',
          imageMobile: '/static/designer/lily-collection-mobile-v2.jpg',
          link: 'lily-collection',
        },
        seoDescription:
          'The Lily collection by British designer James Harrison features sleek silhouettes and striking chevron patterns, showing off a keen eye for detail.',
      },
      'marcel-sigel': {
        name: 'Marcel Sigel',
        country: 'Australia',
        description:
          'Born in Australia, Marcel Sigel is an industrial designer with a penchant for fresh, idiosyncratic yet understated designs. He believes that design should stir emotions and inspire behaviours in people who come into contact with it.<br><br>After finding success in his multidisciplinary ‘zuii’ design studio in Melbourne, he expanded his horizons in Milan before settling in London where he now runs his own studio, working with clients around the world.',
        handle: '@marcelsigel',
        imageDesktop: '/static/designer/marcel-desktop.jpg',
        imageMobile: '/static/designer/marcel-mobile.jpg',
        awards: ['Wallpaper magazine – Best Young Designer'],
        collection: {
          name: 'Bickerton Collection',
          imageDesktop: '/static/designer/bickerton-collection.png',
          imageMobile: '/static/designer/bickerton-collection-mobile.png',
          link: 'bickerton-collection',
        },
        seoDescription:
          'Australian designer Marcel Sigel’s works are distinctive yet understated. He believes that design should inspire and evoke emotions in people.',
      },
    };

    const selectedDesigner = designers[designer];

    const titleEle = (
      <div className={`${style.designer}__name`}>
        <h2>{selectedDesigner.name}</h2>
        <p>
          <span>{selectedDesigner.country}</span> /
          <ReactSVG name="instagram" />
          {selectedDesigner.handle}
        </p>
      </div>
    );
    const collectionUrl = getUrl(addKnightPrefix(selectedDesigner?.collection?.link));

    return (
      <>
        <Breadcrumbs
          location={location}
          showHome={desktop}
          customBreadcrumbs={[
            { customUrl: getUrl('designer-community'), name: 'Castlery Designer Community' },
            { name: selectedDesigner.name },
          ]}
        />
        <div className={style.designer}>
          <Helmet
            path={location.pathname}
            page={{
              title: selectedDesigner.name,
              description: selectedDesigner.seoDescription,
              notIndexed: true,
            }}
          />

          {!desktop && (
            <div>
              {renderImage(selectedDesigner.imageMobile, 0.8, 0.5, {
                alt: selectedDesigner.name,
                lazy: false,
              })}
              {titleEle}
            </div>
          )}
          <div className={`${style.designer}__details`}>
            <div>
              {renderImage(
                selectedDesigner.imageDesktop,

                1,
                0.2,
                { alt: selectedDesigner.name, lazy: false }
              )}
            </div>
            <div>
              {desktop && titleEle}
              <p
                className={`${style.designer}__description`}
                dangerouslySetInnerHTML={{ __html: selectedDesigner.description }}
              />
              {selectedDesigner.awards && (
                <div className={`${style.designer}__awards`}>
                  <h3>Highlighted Awards:</h3>
                  {selectedDesigner.awards.map((award) => (
                    <div key={award} className={`${style.designer}__awards__award`}>
                      {award}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {selectedDesigner.collection && (
            <div className={`${style.designer}__collection`}>
              <div className={`${style.designer}__collection__container`}>
                <Banner
                  className={`${style.designer}__collection__banner`}
                  mediaQueries={[
                    {
                      breakpoint: 'xs',
                      srcset: selectedDesigner.collection.imageMobile,
                      loader: {
                        ratio: 0.8,
                      },
                    },
                    {
                      breakpoint: 'lg',
                      srcset: selectedDesigner.collection.imageDesktop,
                      loader: {
                        ratio: 0.417,
                      },
                    },
                  ]}
                  lazy={false}
                  title="Designer Collection"
                  link={collectionUrl}
                />
                <div className={`${style.designer}__collection__name`}>
                  <Link to={collectionUrl}>
                    {selectedDesigner?.collection?.name} {'>'}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}
