import React from 'react';

import Banner from 'components/Banner';
import PageHeader from 'components/PageHeader';

import { Link } from 'react-router';
import { getUrl } from 'pages';
import { addKnightPrefix } from 'pages/util.js';
import { wrapPage } from 'utils/page';
import { renderImage } from 'utils/image';
import { designers } from 'config';

import { Container } from '@castlery/fortress';
import style from './style.scss';

@wrapPage()
export default class DesignerCommunity extends React.Component {
  render() {
    return (
      <div className={style.designerCommunity}>
        <div className={`${style.designerCommunity}__wrapper`}>
          <Container>
            <PageHeader
              className={`${style.designerCommunity}__banner`}
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset:
                    'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1638235650/category_banner/designer-community-mobile.jpg',
                  loader: { ratio: '0.813333333' },
                },
                {
                  breakpoint: 'lg',
                  srcset:
                    'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1638235650/category_banner/designer-community_desktop.jpg',
                  loader: { ratio: '0.416666667' },
                },
              ]}
              lazy={false}
              title="Designer Community"
              mainTitle="Our Designer Community"
              mainIntro="From mid-century modern to contemporary, our passionate and talented designers bring outstanding designs to the masses."
              subTitle="Put a face to the design"
              subIntro="Meet the team responsible for our exceptional designs."
            />

            <Container maxWidth="md" className={`${style.designerCommunity}__designers`}>
              {designers
                .filter((designer) => !designer.disabled)
                .map((designer) => (
                  <div key={designer.key} className={`${style.designerCommunity}__designer`}>
                    <Link to={`${getUrl('designers')}/${designer.key}`}>
                      <div className={`${style.designerCommunity}__designer-image`}>
                        {renderImage(designer.image, 0.7277, 0.25, {
                          alt: designer.name,
                        })}
                      </div>
                    </Link>
                    <h4 className={`${style.designerCommunity}__designer-name`}>{designer.name}</h4>
                    <div className={`${style.designerCommunity}__designer-country`}>{designer.country}</div>
                  </div>
                ))}
            </Container>

            <Container maxWidth="md" className={`${style.designerCommunity}__collections`}>
              <Link to={getUrl(addKnightPrefix('designer-collections'))}>
                <Banner
                  className={`${style.designerCommunity}__collections__banner`}
                  mediaQueries={[
                    {
                      breakpoint: 'xs',
                      srcset: '/static/designer-community/designer-collections-mobile.png',
                      loader: { ratio: '0.8' },
                    },
                    {
                      breakpoint: 'lg',
                      srcset: '/static/designer-community/designer-collections.png',
                      loader: { ratio: '0.41709' },
                    },
                  ]}
                  lazy={false}
                  title="View Designer Collections"
                />
                <div className={`${style.designerCommunity}__collections__footer`}>
                  <h2 className={`${style.designerCommunity}__collections__title`}>View Designer Collections</h2>
                </div>
              </Link>
            </Container>
          </Container>
        </div>
      </div>
    );
  }
}
